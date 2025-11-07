from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import os
import qrcode


app = Flask(__name__)

# ------------------------
# CONFIGURAÇÕES
# ------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:kleber108d@localhost/equipamentosdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'chave-secreta-aqui'  # muda isto depois!
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'qrcodes')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ------------------------
# MODELOS
# ------------------------

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

class Equipamentos(db.Model):
    __tablename__ = 'equipamentos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    localizacao = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(50), nullable=False)
    codigo = db.Column(db.String(20), unique=True, nullable=False)
    qr_code_path = db.Column(db.String(200), nullable=True)

# ------------------------
# ROTAS DE AUTENTICAÇÃO
# ------------------------

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Usuário já existe!'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Usuário criado com sucesso!'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Credenciais inválidas!'}), 401

    access_token = create_access_token(identity=user.username)
    return jsonify({'token': access_token}), 200

# ------------------------
# ROTAS PROTEGIDAS
# ------------------------

# Página principal (só acessada após login)
@app.route('/home')
def serve_home():
    return render_template('home.html')

# API para registar equipamento (gera QR Code)
@app.route('/registar_equipamento', methods=['POST'])

def registar_equipamento():
    data = request.get_json()
    nome = data.get('nome')
    localizacao = data.get('localizacao')
    estado = data.get('estado')

    # Gera um código único
    codigo = os.urandom(4).hex().upper()

    # Cria o QR code com o código
    qr_img = qrcode.make(codigo)
    qr_filename = f"{codigo}.png"
    qr_path = os.path.join(app.config['UPLOAD_FOLDER'], qr_filename)
    qr_img.save(qr_path)

    # Regista no banco
    equipamento = Equipamentos(
        nome=nome,
        localizacao=localizacao,
        estado=estado,
        codigo=codigo,
        qr_code_path=qr_path
    )
    db.session.add(equipamento)
    db.session.commit()

    return jsonify({
        'message': 'Equipamento registado com sucesso!',
        'codigo': codigo,
        'qr_code_url': f"/static/qrcodes/{qr_filename}"
    }), 201

# Procurar equipamento pelo código
@app.route('/procurar_equipamento', methods=['POST'])
@jwt_required()
def procurar_equipamento():
    data = request.get_json()
    codigo = data.get('codigo')

    equipamento = Equipamentos.query.filter_by(codigo=codigo).first()
    if not equipamento:
        return jsonify({'message': 'Equipamento não encontrado.'}), 404

    return jsonify({
        'nome': equipamento.nome,
        'localizacao': equipamento.localizacao,
        'estado': equipamento.estado,
        'codigo': equipamento.codigo
    }), 200


# ------------------------
# ROTAS DE PÁGINAS
# ------------------------

@app.route('/')
def serve_auth():
    return render_template('auth.html')

# ------------------------
# ROTAS PARA ESTÁTICOS
# ------------------------
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/manifest.json')
def serve_manifest():
    return send_from_directory('.', 'manifest.json', mimetype='application/json')

@app.route('/service-worker.js')
def serve_service_worker():
    return send_from_directory('.', 'service-worker.js', mimetype='application/javascript')

@app.route('/app.js')
def serve_app_js():
    return send_from_directory('.', 'app.js', mimetype='application/javascript')
# ------------------------
# MAIN
# ------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

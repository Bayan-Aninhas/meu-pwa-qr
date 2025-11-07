from flask_sqlalchemy import SQLAlchemy
import uuid

db = SQLAlchemy()

class Equipamento(db.Model):
    __tablename__ = 'equipamentos'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    localizacao = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(50), unique=True, nullable=False)
    qr_code_path = db.Column(db.String(200), nullable=True)

    def __init__(self, nome, localizacao, estado, codigo, qr_code_path=None):
        self.nome = nome
        self.localizacao = localizacao
        self.estado = estado
        self.codigo = codigo
        self.qr_code_path = qr_code_path

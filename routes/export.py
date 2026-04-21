import json
from flask import Blueprint, Response, render_template
from models import Book, Character, Relationship, PlotNode

export_bp = Blueprint('export', __name__, url_prefix='/export')


@export_bp.route('/<int:book_id>/json')
def export_json(book_id):
    """把整本书的所有数据导出为 JSON 文件，可用于备份"""
    book = Book.query.get_or_404(book_id)

    data = {
        'book': {
            'title': book.title,
            'genre': book.genre,
            'description': book.description,
        },
        'characters': [
            {
                'name': c.name,
                'alias': c.alias,
                'age': c.age,
                'gender': c.gender,
                'description': c.description,
                'custom_fields': [
                    {'name': f.field_name, 'value': f.field_value}
                    for f in c.custom_fields
                ]
            }
            for c in book.characters
        ],
        'relationships': [
            {
                'character_a': r.character_a.name,
                'character_b': r.character_b.name,
                'relation_type': r.relation_type,
                'description': r.description
            }
            for r in Relationship.query.filter_by(book_id=book_id).all()
        ],
        'plot_nodes': [
            {
                'title': n.title,
                'order': n.order,
                'time_in_story': n.time_in_story,
                'location': n.location,
                'summary': n.summary,
                'characters': [pc.character.name for pc in n.plot_characters],
                'custom_fields': [
                    {
                        'name': f.field_name,
                        'value': f.field_value,
                        'flagged': f.is_flagged,
                        'flag_note': f.flag_note
                    }
                    for f in n.custom_fields
                ]
            }
            for n in book.plot_nodes
        ]
    }

    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    filename = f"{book.title}_导出.json"

    return Response(
        json_str,
        mimetype='application/json',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'}
    )


@export_bp.route('/<int:book_id>/print')
def print_view(book_id):
    """生成适合打印/导出为PDF的页面（浏览器Ctrl+P即可保存为PDF）"""
    book = Book.query.get_or_404(book_id)
    relationships = Relationship.query.filter_by(book_id=book_id).all()
    return render_template('export/print.html', book=book, relationships=relationships)

#!/usr/bin/env python3
"""Build the three printable two-page student resource guides."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "assets" / "pdfs"
PAGE_W, PAGE_H = A4
LEFT = 44
RIGHT = PAGE_W - 44
CONTENT_W = RIGHT - LEFT

NAVY = colors.HexColor("#0b2145")
GREEN = colors.HexColor("#1b6b5a")
GREEN_DARK = colors.HexColor("#115446")
MUTED = colors.HexColor("#50627d")
BORDER = colors.HexColor("#d7e0e9")
MINT = colors.HexColor("#e6f7f3")
LAVENDER = colors.HexColor("#f0ebff")
ROSE = colors.HexColor("#fff0f1")
WHITE = colors.white
CANVAS = colors.HexColor("#f7fafc")

def register_fonts():
    font_pairs = [
        (Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"), Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")),
        (Path("C:/Windows/Fonts/arial.ttf"), Path("C:/Windows/Fonts/arialbd.ttf")),
        (Path("/System/Library/Fonts/Supplemental/Arial.ttf"), Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")),
    ]
    for regular, bold in font_pairs:
        if regular.is_file() and bold.is_file():
            pdfmetrics.registerFont(TTFont("MenteSans", str(regular)))
            pdfmetrics.registerFont(TTFont("MenteSans-Bold", str(bold)))
            return "MenteSans", "MenteSans-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


GUIDES = [
    {
        "filename": "guia-organizacion-semanal.pdf",
        "title": "Organiza tu semana sin llenarla de más",
        "subject": "Guía práctica de organización semanal para estudiantes",
        "duration": "10 minutos",
        "description": "Una hoja sencilla para sacar los pendientes de tu cabeza, decidir qué importa y elegir un primer paso posible.",
        "steps_title": "Un método en cuatro pasos",
        "steps": [
            ("Haz una descarga mental", "Escribe cada pendiente sin ordenarlo todavía. Incluye entregas, trámites, descanso y asuntos personales."),
            ("Ubica fechas reales", "Anota la fecha de entrega y calcula cuánto tiempo requiere cada tarea. Si no sabes, usa una estimación pequeña y revísala después."),
            ("Elige tres prioridades", "Selecciona una tarea importante, una breve y una de autocuidado. El resto permanece visible, pero no dirige tu día."),
            ("Define el primer movimiento", "Convierte la prioridad principal en una acción de menos de diez minutos: abrir el documento, leer la consigna o escribir tres ideas."),
        ],
        "callout_label": "Regla amable",
        "callout": "Deja espacio libre. Una semana real necesita margen para cambios, cansancio y situaciones inesperadas.",
    },
    {
        "filename": "guia-pausa-respiracion.pdf",
        "title": "Una pausa breve para volver a ti",
        "subject": "Guía breve de respiración y atención para estudiantes",
        "duration": "3 minutos",
        "description": "Una guía de respiración suave y atención al entorno para bajar el ritmo entre clases o antes de retomar una tarea.",
        "steps_title": "Pausa guiada",
        "steps": [
            ("Acomódate", "Apoya los pies o el cuerpo en una superficie estable. Suelta los hombros sin obligarte a cambiar de postura."),
            ("Observa una respiración", "Nota por dónde entra el aire y cómo sale. No intentes corregirlo todavía."),
            ("Alarga un poco la salida", "Inhala con comodidad y deja que la exhalación dure apenas un poco más. Repite cuatro veces, sin contener el aire."),
            ("Vuelve al entorno", "Mira tres objetos, escucha dos sonidos y reconoce una sensación de apoyo en tu cuerpo."),
        ],
        "callout_label": "Hazlo a tu manera",
        "callout": "No tienes que respirar profundo. Mantén una respiración cómoda. Si aparece mareo o incomodidad, detente y vuelve a tu ritmo natural.",
    },
    {
        "filename": "guia-presion-academica.pdf",
        "title": "Cuando la presión académica se acumula",
        "subject": "Guía práctica para manejar presión académica y pedir apoyo",
        "duration": "12 minutos",
        "description": "Una ruta breve para separar lo urgente de lo importante, reducir el problema a acciones concretas y reconocer cuándo pedir apoyo.",
        "steps_title": "De la presión a un plan",
        "steps": [
            ("Nombra lo que pesa", "Escribe la situación de forma concreta: qué entrega es, cuándo vence y qué parte está pendiente."),
            ("Separa control y apoyo", "Marca qué puedes hacer tú, qué necesitas preguntar y qué depende de otra persona o institución."),
            ("Reduce el alcance", "Define una versión mínima y útil: un esquema, una fuente revisada, un correo enviado o una parte terminada."),
            ("Activa apoyo temprano", "Si el tiempo no alcanza o el malestar crece, contacta a alguien antes del límite: docente, compañero, tutoría o bienestar universitario."),
        ],
        "callout_label": "Una decisión útil",
        "callout": "Pedir una aclaración o comunicar una dificultad con tiempo también es avanzar.",
    },
]


def draw_wrapped(c, text, x, top, width, font=FONT, size=10, leading=None, color=MUTED):
    leading = leading or size * 1.42
    lines = simpleSplit(text, font, size, width)
    c.setFillColor(color)
    c.setFont(font, size)
    for index, line in enumerate(lines):
        c.drawString(x, top - size - index * leading, line)
    return top - len(lines) * leading, lines


def draw_header(c, page_number):
    c.setFillColor(GREEN)
    c.circle(LEFT + 12, PAGE_H - 34, 12, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 11)
    c.drawCentredString(LEFT + 12, PAGE_H - 38, "M")
    c.setFillColor(NAVY)
    c.setFont(FONT_BOLD, 10)
    c.drawString(LEFT + 32, PAGE_H - 31, "Mente Universitaria")
    c.setFillColor(MUTED)
    c.setFont(FONT, 8.5)
    c.drawRightString(RIGHT, PAGE_H - 31, f"GUÍA PRÁCTICA     {page_number:02d} / 02")
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.8)
    c.line(LEFT, PAGE_H - 52, RIGHT, PAGE_H - 52)


def draw_footer(c, page_number):
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.8)
    c.line(LEFT, 39, RIGHT, 39)
    c.setFillColor(MUTED)
    c.setFont(FONT, 8)
    c.drawString(LEFT, 25, "Mente Universitaria · Herramientas de bienestar estudiantil")
    c.drawRightString(RIGHT, 25, f"Página {page_number} de 2")


def draw_hero(c, guide):
    x, top, height = LEFT, PAGE_H - 69, 145
    bottom = top - height
    c.setFillColor(LAVENDER)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.9)
    c.roundRect(x, bottom, CONTENT_W, height, 15, fill=1, stroke=1)

    c.setFillColor(GREEN_DARK)
    c.setFont(FONT_BOLD, 8.2)
    c.drawString(x + 20, top - 25, "HERRAMIENTA PARA TU DÍA A DÍA")

    badge_w = stringWidth(guide["duration"], FONT_BOLD, 8.5) + 22
    badge_x = RIGHT - 20 - badge_w
    c.setFillColor(WHITE)
    c.roundRect(badge_x, top - 43, badge_w, 23, 11.5, fill=1, stroke=0)
    c.setFillColor(GREEN_DARK)
    c.setFont(FONT_BOLD, 8.5)
    c.drawCentredString(badge_x + badge_w / 2, top - 35.5, guide["duration"])

    title_top = top - 51
    title_bottom, title_lines = draw_wrapped(c, guide["title"], x + 20, title_top, CONTENT_W - 40, FONT_BOLD, 20.5, 23, NAVY)
    description_top = title_bottom - (6 if len(title_lines) == 1 else 3)
    draw_wrapped(c, guide["description"], x + 20, description_top, CONTENT_W - 40, FONT, 9.8, 13.2, MUTED)
    return bottom


def draw_section_heading(c, text, x, top, size=15):
    c.setFillColor(NAVY)
    c.setFont(FONT_BOLD, size)
    c.drawString(x, top - size, text)
    return top - size - 7


def draw_step(c, x, top, width, number, title, body, height=76):
    bottom = top - height
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.8)
    c.roundRect(x, bottom, width, height, 9, fill=1, stroke=1)

    c.setFillColor(MINT)
    c.circle(x + 22, top - 22, 12, fill=1, stroke=0)
    c.setFillColor(GREEN_DARK)
    c.setFont(FONT_BOLD, 9)
    c.drawCentredString(x + 22, top - 25, str(number))

    text_x = x + 43
    text_w = width - 56
    c.setFillColor(NAVY)
    c.setFont(FONT_BOLD, 10.2)
    c.drawString(text_x, top - 18, title)
    draw_wrapped(c, body, text_x, top - 26, text_w, FONT, 8.8, 11.5, MUTED)
    return bottom


def draw_callout(c, x, top, width, height, label, body, fill=MINT, danger=False):
    bottom = top - height
    c.setFillColor(fill)
    c.setStrokeColor(colors.HexColor("#b42336") if danger else BORDER)
    c.setLineWidth(0.9)
    c.roundRect(x, bottom, width, height, 9, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#b42336") if danger else GREEN_DARK)
    label_lines = simpleSplit(label, FONT_BOLD, 9.2, 118)
    c.setFont(FONT_BOLD, 9.2)
    for index, line in enumerate(label_lines):
        c.drawString(x + 13, top - 18 - index * 11, line)
    body_width = width - 150
    body_leading = 11.2
    body_lines = simpleSplit(body, FONT, 8.9, body_width)
    c.setFillColor(NAVY)
    c.setFont(FONT, 8.9)
    body_start = top - 15
    for index, line in enumerate(body_lines):
        c.drawString(x + 145, body_start - index * body_leading, line)
    return bottom


def draw_guide_page_one(c, guide):
    draw_header(c, 1)
    hero_bottom = draw_hero(c, guide)
    heading_top = hero_bottom - 21
    steps_top = draw_section_heading(c, guide["steps_title"], LEFT, heading_top)
    row_height, gap = 76, 8
    for index, (title, body) in enumerate(guide["steps"], start=1):
        bottom = draw_step(c, LEFT, steps_top, CONTENT_W, index, title, body, row_height)
        steps_top = bottom - gap
    draw_callout(c, LEFT, steps_top - 2, CONTENT_W, 68, guide["callout_label"], guide["callout"], LAVENDER if guide is GUIDES[2] else MINT)
    draw_footer(c, 1)
    c.showPage()


def draw_table(c, x, top, widths, headers, rows, row_heights, header_height=34, font_size=8.7, line_counts=None):
    full_width = sum(widths)
    c.setFillColor(MINT)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.8)
    c.roundRect(x, top - header_height, full_width, header_height, 7, fill=1, stroke=1)
    cursor_x = x
    for width, header in zip(widths, headers):
        draw_wrapped(c, header, cursor_x + 9, top - 8, width - 16, FONT_BOLD, 8.4, 10, NAVY)
        cursor_x += width

    current_top = top - header_height
    for row_index, (row, row_height) in enumerate(zip(rows, row_heights)):
        bottom = current_top - row_height
        c.setFillColor(WHITE)
        c.setStrokeColor(BORDER)
        c.rect(x, bottom, full_width, row_height, fill=1, stroke=1)
        cursor_x = x
        for column_index, (width, value) in enumerate(zip(widths, row)):
            if column_index:
                c.setStrokeColor(BORDER)
                c.line(cursor_x, current_top, cursor_x, bottom)
            if value:
                draw_wrapped(c, value, cursor_x + 9, current_top - 9, width - 17, FONT, font_size, font_size * 1.3, NAVY)
            else:
                requested_lines = line_counts[row_index] if line_counts else 2
                line_gap = 15
                line_y = current_top - 22
                c.setStrokeColor(BORDER)
                c.setLineWidth(0.45)
                for _ in range(requested_lines):
                    if line_y > bottom + 8:
                        c.line(cursor_x + 9, line_y, cursor_x + width - 9, line_y)
                        line_y -= line_gap
            cursor_x += width
        current_top = bottom
    return current_top


def page_two_title(c, title, intro):
    top = PAGE_H - 76
    bottom, _ = draw_wrapped(c, title, LEFT, top, CONTENT_W, FONT_BOLD, 20, 23, NAVY)
    intro_bottom, lines = draw_wrapped(c, intro, LEFT, bottom - 5, CONTENT_W, FONT, 9.6, 13, MUTED)
    return intro_bottom - 19


def draw_organization_page_two(c):
    y = page_two_title(c, "Tu hoja de organización semanal", "Saca los pendientes de tu cabeza y deja espacio para lo que pueda cambiar.")
    y = draw_section_heading(c, "1. Descarga mental", LEFT, y, 13)
    y = draw_table(
        c, LEFT, y, [210, 142, CONTENT_W - 352],
        ["Pendiente", "Fecha límite", "Tiempo estimado"],
        [["", "", ""] for _ in range(5)], [35] * 5, header_height=32, line_counts=[1] * 5,
    )
    y -= 18
    y = draw_section_heading(c, "2. Elige tres prioridades", LEFT, y, 13)
    y = draw_table(
        c, LEFT, y, [132, CONTENT_W - 132],
        ["Prioridad", "Primer paso de menos de 10 minutos"],
        [["Importante", ""], ["Breve", ""], ["Cuidarme", ""]], [45, 45, 45], header_height=34, line_counts=[2, 2, 2],
    )
    y -= 15
    draw_callout(c, LEFT, y, CONTENT_W, 58, "Cierre", "Elige una hora realista para revisar esta hoja. Organizar también significa decidir qué no harás hoy.", LAVENDER)


def draw_pause_page_two(c):
    y = page_two_title(c, "Guion de tres minutos", "Lee las indicaciones a tu ritmo. Puedes detenerte o volver a tu respiración natural cuando quieras.")
    y = draw_table(
        c, LEFT, y, [96, CONTENT_W - 96],
        ["Momento", "Indicación"],
        [
            ["Minuto 1", "Siente el apoyo de tu cuerpo. Observa dos respiraciones tal como están."],
            ["Minuto 2", "Deja que cada salida de aire sea cómoda y un poco más lenta. No retengas el aire."],
            ["Minuto 3", "Mira alrededor. Nombra tres cosas que ves, dos sonidos y un siguiente paso posible."],
        ], [55, 55, 55], header_height=34, font_size=8.8,
    )
    y -= 22
    y = draw_section_heading(c, "Después de la pausa", LEFT, y, 14)
    y = draw_table(
        c, LEFT, y, [160, CONTENT_W - 160],
        ["Pregunta", "Tu respuesta"],
        [["¿Qué noto ahora?", ""], ["¿Qué necesito?", ""], ["¿Cuál es mi siguiente paso?", ""]],
        [62, 62, 62], header_height=34, line_counts=[2, 2, 2], font_size=8.8,
    )
    y -= 16
    draw_callout(c, LEFT, y, CONTENT_W, 68, "Recuerda", "Este ejercicio es opcional y no reemplaza apoyo profesional. Si necesitas acompañamiento, busca una persona o servicio de confianza.", LAVENDER)


def draw_pressure_page_two(c):
    y = page_two_title(c, "Plan para las próximas 24 horas", "Completa una fila por asunto. No necesitas resolver toda la semana en una sola sesión.")
    y = draw_table(
        c, LEFT, y, [CONTENT_W * 0.34, CONTENT_W * 0.33, CONTENT_W * 0.33],
        ["Situación concreta", "Lo que sí puedo hacer", "Apoyo que necesito"],
        [["", "", ""] for _ in range(3)], [58, 58, 58], header_height=40, line_counts=[3, 3, 3],
    )
    y -= 19
    y = draw_section_heading(c, "Mi primer mensaje de apoyo", LEFT, y, 14)
    message = "Hola. Estoy trabajando en [actividad] y tengo una dificultad con [parte concreta]. Ya intenté [acción]. ¿Podrías orientarme sobre [pregunta específica]?"
    lines = simpleSplit(message, FONT, 9.2, CONTENT_W - 28)
    message_height = max(62, len(lines) * 13 + 24)
    c.setFillColor(CANVAS)
    c.setStrokeColor(BORDER)
    c.roundRect(LEFT, y - message_height + 5, CONTENT_W, message_height, 8, fill=1, stroke=1)
    c.setFillColor(NAVY)
    c.setFont(FONT, 9.2)
    for index, line in enumerate(lines):
        c.drawString(LEFT + 14, y - 10 - index * 13, line)
    y -= message_height + 17
    y = draw_section_heading(c, "Revisión breve", LEFT, y, 14)
    checks = [
        "Elegí una acción que puedo iniciar hoy.",
        "Reservé un momento breve de descanso.",
        "Sé a quién contactar si necesito apoyo.",
    ]
    c.setFillColor(WHITE)
    c.setStrokeColor(BORDER)
    c.roundRect(LEFT, y - 75, CONTENT_W, 75, 8, fill=1, stroke=1)
    for index, text in enumerate(checks):
        row_y = y - 21 - index * 23
        c.setFillColor(WHITE)
        c.setStrokeColor(GREEN)
        c.rect(LEFT + 14, row_y - 1, 10, 10, fill=1, stroke=1)
        c.setFillColor(NAVY)
        c.setFont(FONT, 8.9)
        c.drawString(LEFT + 34, row_y + 1, text)
    y -= 91
    draw_callout(c, LEFT, y, CONTENT_W, 66, "Importante", "Esta guía no realiza diagnósticos ni reemplaza atención profesional. Si hay peligro inmediato o riesgo de hacerte daño, busca ayuda de emergencia en tu ubicación.", ROSE, danger=True)


def build_guide(guide):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    path = OUTPUT / guide["filename"]
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    c.setTitle(guide["title"])
    c.setSubject(guide["subject"])
    c.setAuthor("Mente Universitaria")
    c.setCreator("Mente Universitaria · scripts/build-resource-pdfs.py")
    c.setKeywords("bienestar universitario, autocuidado, estudiantes, guía práctica")

    draw_guide_page_one(c, guide)
    draw_header(c, 2)
    if guide["filename"] == "guia-organizacion-semanal.pdf":
        draw_organization_page_two(c)
    elif guide["filename"] == "guia-pausa-respiracion.pdf":
        draw_pause_page_two(c)
    else:
        draw_pressure_page_two(c)
    draw_footer(c, 2)
    c.save()
    print(f"{path.relative_to(ROOT)}")


if __name__ == "__main__":
    for item in GUIDES:
        build_guide(item)

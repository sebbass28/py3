from pathlib import Path
from docx import Document
from docx.shared import Mm, Pt


BASE = Path(r"c:\Users\Sebas\Desktop\py3")
DOCX_PATH = BASE / "Memoria_TFG_IES_El_Grao_v2.docx"
IMAGES_DIR = BASE / "memoria_imagenes"
OUTPUT_PATH = BASE / "Memoria_TFG_IES_El_Grao_v2_con_imagenes.docx"


def main() -> None:
    if not DOCX_PATH.exists():
        raise SystemExit(f"No existe el documento: {DOCX_PATH}")

    image_files = []
    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp", "*.gif"):
        image_files.extend(sorted(IMAGES_DIR.glob(ext)))

    if not image_files:
        raise SystemExit(
            f"No se encontraron imagenes en {IMAGES_DIR}. "
            "Copia ahi tus capturas y vuelve a ejecutar."
        )

    doc = Document(str(DOCX_PATH))

    doc.add_page_break()
    h = doc.add_paragraph("ANEXO DE EVIDENCIAS VISUALES")
    if h.runs:
        h.runs[0].bold = True
        h.runs[0].font.name = "Georgia"
        h.runs[0].font.size = Pt(16)

    doc.add_paragraph(
        "Este anexo contiene capturas de evidencia funcional, Scrum, despliegue y resultados."
    )

    for i, image_path in enumerate(image_files, start=1):
        doc.add_page_break()
        title = doc.add_paragraph(f"Figura {i}. {image_path.stem.replace('_', ' ')}")
        if title.runs:
            title.runs[0].bold = True
            title.runs[0].font.name = "Georgia"
            title.runs[0].font.size = Pt(11)

        p = doc.add_paragraph()
        run = p.add_run()
        run.add_picture(str(image_path), width=Mm(150))

        desc = doc.add_paragraph(
            "Descripcion: completar con contexto de la figura, funcionalidad demostrada y "
            "relacion con objetivos del proyecto."
        )
        if desc.runs:
            desc.runs[0].font.name = "Georgia"
            desc.runs[0].font.size = Pt(11)

    doc.save(str(OUTPUT_PATH))
    print(f"Documento generado: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()


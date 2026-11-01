#!/usr/bin/env python3
"""
Build an editable Word (.docx) version of the resume from resume.html.

resume.html is the single source of truth: this script parses it and writes
Suraj_Kumar_Resume.docx next to it, so the PDF, the web page and the Word file
never drift apart.

Usage:  python build-docx.py
"""

import os
import re
import zipfile
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(HERE, "resume.html")
TARGET = os.path.join(HERE, "Suraj_Kumar_Resume.docx")

# A4 in twips
PAGE_W = 11906
MARGIN_LR = 794          # 14 mm
CONTENT_W = PAGE_W - 2 * MARGIN_LR

NAVY = "14213D"
GREY = "4A5A7A"
MID = "3F4C63"


# --------------------------------------------------------------------------
# 1. Parse the HTML into a flat list of blocks
# --------------------------------------------------------------------------
class ResumeParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.blocks = []
        self.stack = []
        self.mode = None          # name | role | contact | h2 | p | skill | head | sub | li | note
        self.buf = {"k": "", "v": "", "t": "", "stack": "", "d": "", "text": ""}

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get("class", "")
        self.stack.append((tag, cls))

        if "name" in cls.split():
            self.mode, self.buf["text"] = "name", ""
        elif "role" in cls.split():
            self.mode, self.buf["text"] = "role", ""
        elif "contact" in cls.split():
            self.mode, self.buf["text"] = "contact", ""
        elif tag == "h2":
            self.mode, self.buf["text"] = "h2", ""
        elif tag == "p":
            self.mode, self.buf["text"] = "p", ""
        elif "skill" in cls.split():
            self.mode = "skill"
            self.buf.update({"k": "", "v": ""})
        elif "head" in cls.split():
            self.mode = "head"
            self.buf.update({"t": "", "stack": "", "d": ""})
        elif "sub" in cls.split():
            self.mode, self.buf["text"] = "sub", ""
        elif "note" in cls.split():
            self.mode, self.buf["text"] = "note", ""
        elif tag == "li":
            self.mode, self.buf["text"] = "li", ""
        elif "k" in cls.split() and self.mode == "skill":
            self.mode = "skill_k"
        elif "v" in cls.split() and self.mode == "skill":
            self.mode = "skill_v"
        elif "stack" in cls.split() and self.mode == "head":
            self.mode = "head_stack"
        elif "d" in cls.split() and self.mode == "head":
            self.mode = "head_d"
        elif "t" in cls.split() and self.mode == "head":
            self.mode = "head_t"

    def handle_endtag(self, tag):
        cls = self.stack[-1][1] if self.stack else ""
        if self.stack:
            self.stack.pop()

        if tag in ("h2", "p", "li") or "name" in cls or "role" in cls or "contact" in cls \
           or "sub" in cls or "note" in cls or tag == "div" and self.mode in (
               "name", "role", "contact", "skill", "head", "sub", "note"):
            text = re.sub(r"\s+", " ", self.buf["text"]).strip()

            if self.mode in ("name", "role", "contact", "h2", "p", "sub", "note", "li"):
                if text:
                    self.blocks.append((self.mode, text))
            elif self.mode == "skill":
                k = re.sub(r"\s+", " ", self.buf["k"]).strip()
                v = re.sub(r"\s+", " ", self.buf["v"]).strip()
                if k:
                    self.blocks.append(("skill", (k, v)))
            elif self.mode == "head":
                t = re.sub(r"\s+", " ", self.buf["t"]).strip()
                st = re.sub(r"\s+", " ", self.buf["stack"]).strip()
                d = re.sub(r"\s+", " ", self.buf["d"]).strip()
                if t:
                    self.blocks.append(("head", (t, st, d)))
            self.mode = None
            self.buf = {"k": "", "v": "", "t": "", "stack": "", "d": "", "text": ""}
        elif self.mode in ("skill_k", "skill_v", "head_t", "head_stack", "head_d"):
            self.mode = "skill" if self.mode.startswith("skill") else "head"

    def handle_data(self, data):
        if not self.mode:
            return
        if self.mode == "skill_k":
            self.buf["k"] += data
        elif self.mode == "skill_v":
            self.buf["v"] += data
        elif self.mode == "head_t":
            self.buf["t"] += data
        elif self.mode == "head_stack":
            self.buf["stack"] += data
        elif self.mode == "head_d":
            self.buf["d"] += data
        else:
            self.buf["text"] += data


def parse(path):
    with open(path, encoding="utf-8") as fh:
        html = fh.read()
    body = html.split("<body>", 1)[1].split("</body>", 1)[0]
    p = ResumeParser()
    p.feed(body)
    return p.blocks


# --------------------------------------------------------------------------
# 2. Emit WordprocessingML
# --------------------------------------------------------------------------
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def run(text, bold=False, italic=False, color=None, size=None):
    props = []
    if bold:
        props.append("<w:b/>")
    if italic:
        props.append("<w:i/>")
    if color:
        props.append(f'<w:color w:val="{color}"/>')
    if size:
        props.append(f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>')
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>" if props else ""
    body = []
    for i, piece in enumerate(text.split("\t")):
        if i:
            body.append("<w:tab/>")
        if piece:
            body.append(f'<w:t xml:space="preserve">{esc(piece)}</w:t>')
    return f'<w:r>{rpr}{"".join(body)}</w:r>'


def para(runs, align=None, before=0, after=0, tab_right=False,
         tab_left=None, border=False, indent=None):
    ppr = []
    if border:
        ppr.append('<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="2" '
                   'w:color="C8D1E0"/></w:pBdr>')
    if tab_right or tab_left:
        stops = ""
        if tab_left:
            stops += f'<w:tab w:val="left" w:pos="{tab_left}"/>'
        if tab_right:
            stops += f'<w:tab w:val="right" w:pos="{CONTENT_W}"/>'
        ppr.append(f"<w:tabs>{stops}</w:tabs>")
    ppr.append('<w:spacing w:before="%d" w:after="%d" w:line="252" w:lineRule="auto"/>'
               % (before, after))
    if indent:
        ppr.append(f'<w:ind w:left="{indent}" w:hanging="{indent}"/>')
    if align:
        ppr.append(f'<w:jc w:val="{align}"/>')
    return "<w:p><w:pPr>%s</w:pPr>%s</w:p>" % ("".join(ppr), "".join(runs))


def build_document(blocks):
    out = []

    for kind, value in blocks:
        if kind == "name":
            out.append(para([run(value, bold=True, color=NAVY, size=40)],
                            align="center", after=40))
        elif kind == "role":
            out.append(para([run(value, bold=True, color=MID, size=21)],
                            align="center", after=40))
        elif kind == "contact":
            text = value.replace("|", "\u00a0\u00a0|\u00a0\u00a0")
            out.append(para([run(text, color=MID, size=19)],
                            align="center", after=20))
        elif kind == "h2":
            out.append(para([run(value.upper(), bold=True, color=NAVY, size=20)],
                            before=200, after=60, border=True))
        elif kind == "p":
            out.append(para([run(value, size=20)], after=20))
        elif kind == "skill":
            k, v = value
            out.append(para([run(k, bold=True, color=NAVY, size=20),
                             run("\t" + v, size=20)], after=20, tab_left=1530))
        elif kind == "head":
            t, stack, d = value
            runs = [run(t, bold=True, color=NAVY, size=21)]
            if stack:
                runs.append(run(" " + stack, color=GREY, size=19))
            if d:
                runs.append(run("\t" + d, color=GREY, size=19))
            out.append(para(runs, tab_right=bool(d), after=0))
        elif kind == "sub":
            out.append(para([run(value, color=GREY, size=19)], after=20))
        elif kind == "li":
            out.append(para([run("\u2022  " + value, size=20)], after=20, indent=284))
        elif kind == "note":
            out.append(para([run(value, italic=True, color="5A6580", size=19)],
                            before=60, after=0))

    sect = ('<w:sectPr><w:pgSz w:w="%d" w:h="16838"/>'
            '<w:pgMar w:top="680" w:right="%d" w:bottom="680" w:left="%d" '
            'w:header="0" w:footer="0" w:gutter="0"/></w:sectPr>'
            % (PAGE_W, MARGIN_LR, MARGIN_LR))

    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            "<w:body>" + "".join(out) + sect + "</w:body></w:document>")


STYLES = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
      <w:sz w:val="20"/><w:szCs w:val="20"/>
    </w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="252" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
  </w:style>
</w:styles>'''

CONTENT_TYPES = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>'''

RELS = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>'''

DOC_RELS = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

CORE = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Suraj Kumar — Resume</dc:title>
  <dc:creator>Suraj Kumar</dc:creator>
</cp:coreProperties>'''


def main():
    blocks = parse(SOURCE)
    document = build_document(blocks)

    with zipfile.ZipFile(TARGET, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", RELS)
        z.writestr("docProps/core.xml", CORE)
        z.writestr("word/document.xml", document)
        z.writestr("word/styles.xml", STYLES)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS)

    print("blocks:", len(blocks))
    for kind, value in blocks:
        print("  ", kind, "|", value if isinstance(value, str) else value)
    print("\nwrote", TARGET, os.path.getsize(TARGET), "bytes")


if __name__ == "__main__":
    main()

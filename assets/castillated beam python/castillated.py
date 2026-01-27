# -*- coding: utf-8 -*-
"""
캐스틸레이티드 보 전체 계산서 (Option 1: e = 200 mm)
- AISC 360 (LRFD)
- AISC Design Guide 31 (DG31)
- 한국어 PDF 계산서 자동 생성
"""

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
import math
import pandas as pd

# ---------------------------------------------------------------------
# 1. 한글 폰트 등록 (Nanum Gothic)
# ---------------------------------------------------------------------
pdfmetrics.registerFont(TTFont("NanumGothic", "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"))
pdfmetrics.registerFont(TTFont("NanumGothicBold", "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf"))

# ---------------------------------------------------------------------
# 2. 입력값
# ---------------------------------------------------------------------
L = 13.5                     # m
DL, LL, self_w = 8.0, 6.0, 1.0
Fy = 355.0                   # MPa (SM355)

bf, tf, tw = 200.0, 17.0, 11.0
dc, ho, p = 0.9, 0.6, 0.9     # m
theta = 60.0                 # deg
end_post = 0.9               # m

# Option 1
e = 200.0                    # mm
delta_x = (ho * 1000.0) / (2.0 * math.sqrt(3.0))
W_open = e + 2.0 * delta_x
b_wp = p * 1000.0 - W_open

# ---------------------------------------------------------------------
# 3. 하중 및 전단/모멘트
# ---------------------------------------------------------------------
wu = 1.2 * (DL + self_w) + 1.6 * LL

def Vx(x):
    return 0.5 * wu * L - wu * x

def Mx(x):
    return 0.5 * wu * x * (L - x)

# 개구부 개수 (부동소수 오차 보정)
L_open = L - 2.0 * end_post
N = int(round(L_open / p))
x1 = end_post + 0.5 * p
xs = [x1 + i * p for i in range(N)]

# ---------------------------------------------------------------------
# 4. Tee 및 상호작용
# ---------------------------------------------------------------------
phiPn = 1553.7      # kN
phiMn = 21.47       # kN·m
d_eff = 0.8379      # m
e_over_4 = (e / 4.0) / 1000.0

rows = []
for i, x in enumerate(xs, start=1):
    V = Vx(x)
    M = Mx(x)
    P = M / d_eff
    Mtee = abs(V) * e_over_4
    UR = abs(P) / phiPn + Mtee / phiMn
    rows.append([i, x, V, M, P, Mtee, UR])

df = pd.DataFrame(
    rows,
    columns=["i", "x (m)", "V(x) (kN)", "M(x) (kN·m)", "P_i (kN)", "M_tee,i (kN·m)", "UR_i"]
)

# 지배 개구부
gov_row = df.loc[df["UR_i"].idxmax()]

# 지배 web-post
dP = df["P_i (kN)"].diff().abs()
Vrh = float(dP.max())
idx = int(dP.idxmax())
pair = (int(df.loc[idx - 1, "i"]), int(df.loc[idx, "i"]))

# ---------------------------------------------------------------------
# 5. DG31 web-post buckling
# ---------------------------------------------------------------------
h_top = 0.4189
Mrh = Vrh * h_top

Mp = (0.25 * tw * (e + 2 * delta_x) ** 2 * Fy) / 1e6
etw = e / tw
r10, r20 = 0.408, 0.437
ratio = r10 + (r20 - r10) * ((etw - 10) / 10) if 10 < etw < 20 else (r10 if etw <= 10 else r20)

Mocr = ratio * Mp
phi_b = 0.90
phiMocr = phi_b * Mocr
buckling_ok = Mrh <= phiMocr

# ---------------------------------------------------------------------
# 6. 용접 설계 (안전측)
# ---------------------------------------------------------------------
Fexx = 490.0
phi_w = 0.75
Aw_req = (Vrh * 1000.0) / (phi_w * 0.6 * Fexx)
w_req = Aw_req / (0.707 * e)
w_final = math.ceil(w_req)

# ---------------------------------------------------------------------
# 7. PDF 스타일
# ---------------------------------------------------------------------
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="H1", fontName="NanumGothicBold", fontSize=16))
styles.add(ParagraphStyle(name="H2", fontName="NanumGothicBold", fontSize=12))
styles.add(ParagraphStyle(name="Body", fontName="NanumGothic", fontSize=9.5))
styles.add(ParagraphStyle(name="Small", fontName="NanumGothic", fontSize=8, textColor=colors.grey))

# ---------------------------------------------------------------------
# 8. PDF 생성
# ---------------------------------------------------------------------
doc = SimpleDocTemplate(
    "castellated_beam_전체계산서_option1.pdf",
    pagesize=A4,
    leftMargin=16 * mm,
    rightMargin=16 * mm,
    topMargin=14 * mm,
    bottomMargin=14 * mm,
)

story = []

story.append(Paragraph("캐스틸레이티드 보 전체 계산서 (옵션 1: e = 200 mm)", styles["H1"]))
story.append(Spacer(1, 6))

story.append(Paragraph("1. 입력조건", styles["H2"]))
story.append(Paragraph(
    f"- 경간 L = {L:.2f} m<br/>"
    f"- DL = {DL:.1f} kN/m, LL = {LL:.1f} kN/m, 자중 ≈ {self_w:.1f} kN/m<br/>"
    f"- 강재: SM355 (Fy = {Fy:.0f} MPa)<br/>"
    f"- 원단면: H600×200×11×17<br/>"
    f"- p = {p:.2f} m, ho = {ho:.2f} m, θ = {theta:.0f}°<br/>"
    f"- 옵션 1: e = {e:.0f} mm, 개구부 수 = {len(df)}",
    styles["Body"]
))

story.append(Spacer(1, 6))
story.append(Paragraph("※ 지배 개구부, web-post, buckling, 용접 검토 포함", styles["Small"]))

doc.build(story)

print("PDF 생성 완료: castellated_beam_전체계산서_option1.pdf")

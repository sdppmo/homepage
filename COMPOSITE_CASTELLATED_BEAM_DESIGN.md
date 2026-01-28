# Composite Castellated Beam Design - AISC 기준 입력변수 및 검토식

## 1. 추가 입력변수

### 1.1 슬래브 관련 변수
- **슬래브 두께 (ts, mm)**: 이미 존재
- **슬래브 유효폭 (beff, m)**: AISC I3.1에 따른 유효폭
  - beff = min(L/4, 보간격, b0 + 16ts)
  - b0: 전단연결재 중심 간격
- **콘크리트 압축강도 (f'c, MPa)**: 이미 존재
- **콘크리트 단위중량 (γc, kN/m³)**: 일반적으로 24 kN/m³
- **콘크리트 탄성계수 (Ec, MPa)**: Ec = 4700√(f'c) (AISC I2.1)

### 1.2 전단연결재 (Shear Connector) 관련 변수
- **전단연결재 타입**: 
  - Stud (헤드 스터드)
  - Channel (채널형)
  - 기타
- **스터드 직경 (d, mm)**: 일반적으로 19mm, 22mm, 25mm
- **스터드 높이 (h, mm)**: 슬래브 두께보다 최소 38mm 이상
- **스터드 설계기준 인장강도 (fu, MPa)**: 일반적으로 400 MPa
- **스터드 열수 (n)**: 보 폭 방향 스터드 개수
- **스터드 간격 (s, mm)**: 보 길이 방향 스터드 간격
- **스터드 배치 형태**: 
  - 균등 간격
  - 집중 배치 (최대 모멘트 구간)
- **데크플레이트 사용 여부**: 
  - Yes/No
  - 데크플레이트 두께 (td, mm)
  - 데크플레이트 골 방향: 보에 직각 또는 평행

### 1.3 하중 관련 변수
- **시공하중 (qConst, kN/m²)**: 이미 존재
- **하중 단계별 검토**:
  - 시공 단계 (Steel Beam Only)
  - 합성 단계 (Composite Action)

## 2. 주요 검토식 (AISC 360 Chapter I)

### 2.1 합성 단면 특성 계산

#### 2.1.1 변환 단면 (Transformed Section)
- **모듈러 비율 (n)**: n = Es / Ec
- **유효폭 변환**: beff / n

#### 2.1.2 중립축 위치 (Neutral Axis)
- **중립축이 슬래브 내부인 경우**:
  - y = (As × d/2 + beff/n × ts × (d + ts/2)) / (As + beff/n × ts)
- **중립축이 강재 내부인 경우**:
  - 반복 계산 필요

#### 2.1.3 합성 단면 2차 모멘트 (Icomp)
- **슬래브 부분**: Islab = beff/n × ts³ / 12 + beff/n × ts × (y - ts/2)²
- **강재 부분**: Isteel = Ix + As × (y - d/2)²
- **합성**: Icomp = Islab + Isteel

#### 2.1.4 합성 단면 탄성 모멘트 (Scomp)
- **상부**: Stop = Icomp / y
- **하부**: Sbot = Icomp / (d + ts - y)

### 2.2 수평전단력 (Horizontal Shear Force) 계산

#### 2.2.1 최대 수평전단력 (Vh)
- **콘크리트 압축력**: Cc = 0.85 × f'c × beff × ts
- **강재 인장력**: Cs = Fy × As
- **Vh = min(Cc, Cs)**

#### 2.2.2 구간별 수평전단력
- **최대 모멘트 위치에서 영점까지**: Vh
- **구간별 분포**: 선형 분포 가정

### 2.3 전단연결재 강도 (Shear Connector Strength)

#### 2.3.1 스터드 공칭강도 (Qn) - AISC I8.3
- **콘크리트 파괴**: Qn1 = 0.5 × Asc × √(f'c × Ec) × Rg × Rp
- **스터드 파괴**: Qn2 = Asc × fu × Rg × Rp
- **Qn = min(Qn1, Qn2)**

여기서:
- Asc: 스터드 단면적 = π × d² / 4
- Rg: 그룹 계수 (AISC Table I8-1)
  - 데크플레이트 없음: Rg = 1.0
  - 데크플레이트 있음 (골 방향 직각): Rg = 0.85
  - 데크플레이트 있음 (골 방향 평행): Rg = 1.0
- Rp: 위치 계수 (AISC Table I8-1)
  - 슬래브 상부: Rp = 0.75
  - 슬래브 하부: Rp = 1.0

#### 2.3.2 스터드 설계강도 (φQn)
- **저항계수**: φ = 0.75 (AISC I8.3)
- **φQn = 0.75 × Qn**

### 2.4 소요 전단연결재 개수

#### 2.4.1 최대 모멘트 구간
- **소요 개수**: Nreq = Vh / (φQn × n)
- 여기서 n: 스터드 열수

#### 2.4.2 간격 검토
- **최소 간격**: s ≥ 6d (스터드 직경의 6배)
- **최대 간격**: s ≤ 8ts (슬래브 두께의 8배) 또는 600mm 중 작은 값

### 2.5 합성 휨강도 (Composite Flexural Strength)

#### 2.5.1 탄성 설계 (Service Load)
- **응력 검토**: 
  - 강재: σs = M / Sbot ≤ Fy
  - 콘크리트: σc = M / (Stop × n) ≤ 0.45f'c

#### 2.5.2 소성 설계 (Plastic Design) - AISC I3.3
- **소성 모멘트 (Mp)**: 
  - 중립축 위치에 따라 계산
  - PNA (Plastic Neutral Axis) 위치 결정

#### 2.5.3 설계 모멘트 강도 (φMn)
- **저항계수**: φ = 0.90
- **φMn = 0.90 × Mn**

### 2.6 전단강도 검토

#### 2.6.1 합성 단면 전단강도
- **기존 Castellated Beam 전단강도 검토와 동일**
- **Vierendeel 거동 검토**: 기존과 동일
- **Web Post 전단 파괴**: 기존과 동일

### 2.7 처짐 검토

#### 2.7.1 즉시 처짐 (Immediate Deflection)
- **합성 단면 처짐**: δ = 5wL⁴ / (384 × Ec × Icomp)
- **하중 분배**: 
  - 시공하중: Steel Beam Only
  - 합성하중: Composite Section

#### 2.7.2 장기 처짐 (Long-term Deflection)
- **크리프 계수**: 일반적으로 2.0
- **장기 처짐**: δlong = δimmediate × (1 + creep factor)

### 2.8 시공 단계 검토

#### 2.8.1 Steel Beam Only 검토
- **시공하중에 대한 검토**: 기존 Non-Composite 검토와 동일
- **휨강도**: φMn (Steel Only)
- **전단강도**: φVn (Steel Only)

#### 2.8.2 합성 단계 검토
- **최종 하중에 대한 검토**: 합성 단면 사용
- **휨강도**: φMn (Composite)
- **전단강도**: φVn (Castellated Beam)

## 3. Castellated Beam 특수 고려사항

### 3.1 개구부 구간 전단연결재 배치
- **개구부 위치**: 전단연결재 배치 시 개구부 위치 고려
- **Web Post 구간**: 전단연결재가 Web Post에 미치는 영향 검토

### 3.2 합성 효과에 따른 개구부 응력 분포
- **개구부 구간 Vierendeel 모멘트**: 합성 효과로 인한 변화 검토
- **Web Post 전단력**: 합성 효과 고려

## 4. 검토 순서

1. **입력변수 확인**
2. **합성 단면 특성 계산**
3. **수평전단력 계산**
4. **전단연결재 강도 계산**
5. **소요 전단연결재 개수 및 배치 결정**
6. **합성 휨강도 검토**
7. **전단강도 검토 (Castellated Beam 특성 유지)**
8. **처짐 검토**
9. **시공 단계 검토**

## 5. 참고문헌

- AISC 360-16/22: Specification for Structural Steel Buildings, Chapter I (Composite Members)
- AISC Design Guide 31: Castellated and Cellular Beams
- AISC Steel Construction Manual, 15th Edition

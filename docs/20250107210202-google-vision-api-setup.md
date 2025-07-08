# Google Vision API 설정 가이드

## 1. Google Cloud Console에서 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 상단의 프로젝트 선택 드롭다운 클릭
3. "새 프로젝트" 클릭
4. 프로젝트 이름 입력 (예: "legal-pdf-ocr")
5. "만들기" 클릭

## 2. Vision API 활성화

1. 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 클릭
2. 검색창에 "Cloud Vision API" 입력
3. "Cloud Vision API" 선택
4. "사용" 버튼 클릭

## 3. 서비스 계정 생성 및 키 다운로드

1. 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 클릭
2. 상단의 "+ 사용자 인증 정보 만들기" 클릭
3. "서비스 계정" 선택
4. 서비스 계정 세부정보 입력:
   - 서비스 계정 이름: `legal-pdf-ocr-service`
   - 서비스 계정 ID: 자동 생성됨
   - 설명: "PDF OCR 서비스용 계정"
5. "만들고 계속하기" 클릭
6. 역할 선택: "Cloud Vision" > "Cloud Vision API 사용자" 선택
7. "계속" 클릭
8. "완료" 클릭

### 키 파일 다운로드

1. 생성된 서비스 계정 클릭
2. "키" 탭 선택
3. "키 추가" > "새 키 만들기" 클릭
4. 키 유형: "JSON" 선택
5. "만들기" 클릭
6. JSON 파일이 자동으로 다운로드됨

## 4. JSON 파일 저장 및 경로 확인

1. 다운로드된 JSON 파일을 안전한 위치에 저장
   ```bash
   # 예시: 홈 디렉토리에 .credentials 폴더 생성
   mkdir -p ~/.credentials
   mv ~/Downloads/legal-pdf-ocr-*.json ~/.credentials/google-vision-api.json
   ```

2. 파일 권한 설정 (보안)
   ```bash
   chmod 600 ~/.credentials/google-vision-api.json
   ```

3. 절대 경로 확인
   ```bash
   # macOS/Linux
   echo ~/.credentials/google-vision-api.json | xargs realpath
   
   # 또는
   pwd ~/.credentials/google-vision-api.json
   ```

## 5. 애플리케이션에서 설정

1. 웹 애플리케이션 접속 (http://localhost:3000)
2. 우측 상단의 설정(톱니바퀴) 아이콘 클릭
3. "인증 파일 경로"에 위에서 확인한 절대 경로 입력
   - 예: `/Users/yourname/.credentials/google-vision-api.json`
4. "연결 테스트" 버튼 클릭
5. "API 연결 성공!" 메시지 확인
6. "저장" 버튼 클릭

## 6. 요금 및 할당량

### 무료 사용량
- 매월 첫 1,000개 유닛 무료
- PDF 페이지당 1 유닛 소비

### 유료 요금 (1,000개 초과 시)
- 1,001 ~ 5,000,000 유닛: $1.50 / 1,000 유닛
- 5,000,001 유닛 이상: $0.60 / 1,000 유닛

### 예상 비용
- 월 1,000페이지 이하: 무료
- 월 10,000페이지: 약 $13.50
- 월 100,000페이지: 약 $148.50

## 7. 보안 주의사항

1. **JSON 키 파일 보안**
   - Git에 커밋하지 마세요
   - 공개 폴더에 저장하지 마세요
   - 다른 사람과 공유하지 마세요

2. **.gitignore에 추가**
   ```
   # Google Cloud credentials
   *.json
   .credentials/
   ```

3. **프로덕션 환경**
   - 환경 변수나 시크릿 관리 서비스 사용 권장
   - 파일 시스템 대신 환경 변수로 관리

## 8. 문제 해결

### "API가 활성화되지 않음" 오류
- Google Cloud Console에서 Vision API가 활성화되어 있는지 확인
- 프로젝트가 올바른지 확인

### "인증 실패" 오류
- JSON 파일 경로가 정확한지 확인
- 파일이 존재하는지 확인: `ls -la /path/to/your/file.json`
- JSON 파일이 손상되지 않았는지 확인

### "할당량 초과" 오류
- Google Cloud Console에서 할당량 확인
- 필요시 결제 계정 연결

## 9. 테스트

설정이 완료되면:
1. PDF 파일 업로드
2. "텍스트 추출 시작" 클릭
3. OCR 처리 진행률 확인
4. 추출된 한국어 텍스트 확인

---

**참고**: 개발 환경에서는 Google Vision API 설정 없이도 모의 OCR 처리가 가능합니다.
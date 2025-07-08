# 전자소송 PDF OCR 변환기

## 프로젝트 개요
한국 전자소송 시스템의 PDF 파일을 Google Vision API를 사용하여 편집 가능한 텍스트로 변환하는 Rails 8 기반 웹 애플리케이션

## 개발 환경 설정

### 1. 의존성 설치
```bash
bundle install
```

### 2. 데이터베이스 설정
```bash
rails db:create
rails db:migrate
```

### 3. 개발 서버 실행
```bash
./bin/dev
```
이 명령어는 다음을 동시에 실행합니다:
- Rails 서버 (포트 3000)
- Tailwind CSS 감시자
- Solid Queue (백그라운드 작업)

### 4. 애플리케이션 접속
브라우저에서 http://localhost:3000 접속

## 기능 사용법

### 1. Google Vision API 설정 (선택사항)
- 우측 상단의 설정(톱니바퀴) 아이콘 클릭
- Google Cloud 서비스 계정 JSON 파일 경로 입력
- "연결 테스트" 버튼으로 검증
- 저장

**참고**: 개발 환경에서 API를 설정하지 않으면 모의 OCR 처리가 실행됩니다.

### 2. PDF 업로드
- 드래그 앤 드롭 또는 "파일 선택" 버튼 클릭
- PDF 파일 선택 (최대 50MB)

### 3. OCR 처리
- "텍스트 추출 시작" 버튼 클릭
- 진행률 표시 확인
- 완료 후 추출된 텍스트 확인

### 4. 텍스트 편집 및 다운로드
- 각 페이지별로 텍스트 편집 가능
- "전체 복사" 버튼으로 클립보드에 복사
- "다운로드" 버튼으로 TXT 파일 저장

## 기술 스택
- Ruby on Rails 8
- Stimulus.js (프론트엔드)
- Tailwind CSS (스타일링)
- Google Vision API (OCR)
- Active Storage (파일 업로드)
- Solid Queue (백그라운드 작업)

## 테스트 실행
```bash
rails test
```

## 린트 실행
```bash
rubocop
```

## 배포
Kamal을 사용한 배포:
```bash
kamal deploy
```
# 🦊 SteamFox INTJ — Phaser ARPG + 자동 생성 파이프라인

**SteamFox INTJ**는 스팀펑크 세계관 기반의 2D ARPG로,  
Phaser.js, Firebase Firestore, Google Drive, GitHub Actions를 활용한  
**완전 자동화된 데이터·이미지 생성 파이프라인**을 목표로 합니다.

INTJ‑A 성향의 탐구자 여우 캐릭터를 중심으로  
탐험, 제작, 로봇 탑승, 전투가 결합된 모바일 웹 게임입니다.

---

## 🚀 주요 특징

### 1. **Phaser.js 기반 ARPG**
- 모바일 웹 최적화
- 픽셀 아트 기반 캐릭터 및 맵
- 이동, 상호작용, 전투 시스템 확장 예정

### 2. **자동 생성 파이프라인 (GitHub → Drive → Firestore → Phaser)**
- `generate.js`  
  - 게임 데이터 자동 생성  
  - 시편(Psalms) 20% 포함한 세계관 텍스트 자동 구성
- `drive.js`  
  - Google Drive에 이미지 자동 업로드
- `firestore.js`  
  - Firestore에 이미지·데이터 경로 자동 저장
- `uploadImages.js`  
  - `/images` 폴더의 PNG 파일을 자동 스캔하여 Drive + Firestore 반영

### 3. **GitHub Actions 자동 빌드**
- main 브랜치 push 시 자동 실행
- 데이터 생성 → Drive 업로드 → Firestore 업데이트 → 빌드까지 자동화

### 4. **픽셀 아트 캐릭터**
- Copilot 기반 아트 디렉션
- Idle / Walk / Attack 스프라이트 확장 예정
- 로봇 탑승 버전도 자동 생성 예정

---

## 📁 프로젝트 구조


# Steampunk Latin Psalm ARPG

자동 생성된 맵, 몬스터, NPC, 퀘스트, 던전, 보스, 스킬, 장비를 사용하는  
Phaser 기반 2D ARPG 프로젝트입니다.  
BGM은 Suno에서 수동으로 생성한 mp3 파일을 사용하며,  
`public/audio` 폴더에 추가하면 바로 게임에 적용되도록 구성되어 있습니다.

---

## 1. 폴더 구조

```bash
src/
  scenes/
    BootScene.js
    OverworldScene.js
    DungeonScene.js
public/
  audio/
    overworld_bgm.mp3
    dungeon_bgm.mp3
    boss_bgm.mp3
    village_bgm.mp3
    story_bgm.mp3

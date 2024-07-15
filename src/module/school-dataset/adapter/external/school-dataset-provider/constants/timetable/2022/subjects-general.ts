// 보통 교과 과목

export enum KoreanLanguageSubjects {
  // 공통 과목
  CommonKoreanLanguage_I = '공통국어1',
  CommonKoreanLanguage_II = '공통국어2',

  // 일반 선택
  SpeechAndLanguage = '화법과 언어',
  ReadingAndComposition = '독서와 작문',
  Literature = '문학',

  // 진로 선택
  ResearchBasedReading = '주제 탐구 독서',
  LiteratureAndFilm = '문학과 영상',
  BusinessCommunication = '직무 의사소통',

  // 융합 선택
  DiscussionAndWriting = '독서 토론과 글쓰기',
  MediaCommunication = '매체 의사소통',
  LanguageStudies = '언어생활 탐구',
}

export enum MathematicsSubjects {
  // 공통 과목
  CommonMathematics_I = '공통수학1',
  CommonMathematics_II = '공통수학2',

  // 일반 선택
  Algebra = '대수',
  DifferentiationAndIntegration_I = '미적분I',
  ProbabilityAndStatistics = '확률과 통계',

  // 진로 선택
  Geometry = '기하',
  DifferentiationAndIntegration_II = '미적분II',
  MathematicsForEconomics = '경제 수학',
  MathematicsForAI = '인공지능 수학',
  BusinessMathematics = '직무 수학',

  // 진로 선택 (특목고)
  AdvancedMathematics = '전문 수학',
  DiscreteMathematics = '이산 수학',
  AdvancedGeometry = '고급 기하',
  AdvancedAlgebra = '고급 대수',
  AdvancedCalculus = '고급 미적분',

  // 융합 선택
  MathematicsAndCulture = '수학과 문화',
  PracticalStatistics = '실용 통계',
  MathematicsProjectInquiry = '수학과제 탐구',
}

export enum EnglishSubjects {
  // 공통 과목
  CommonEnglish_I = '공통영어I',
  CommonEnglish_II = '공통영어II',

  // 일반 선택
  English_I = '영어I',
  English_II = '영어II',
  EnlgishReadingAndComposition = '영어 독해와 작문',

  // 진로 선택
  EnglishLiteratureReading = '영미 문학 읽기',
  EnglishDebateAndPresentation = '영어 발표와 토론',
  AdvancedEnglish = '심화 영어',
  AdvancedEnglishReadingAndComposition = '심화 영어 독해와 작문',
  BusinessMathematics = '직무 영어',

  // 융합 선택
  PracticalEnglishConversaion = '실생활 영어 회화',
  EnglishMedia = '미디어 영어',
  EnglishOnGlobalCultures = '세계 문화와 영어',
}

export enum SocialStudiesSubjects {
  // 공통 과목
  KoreanHistory_I = '한국사1',
  KoreanHistory_II = '한국사2',
  IntegratedSocialStudies_I = '통합사회1',
  IntegratedSocialStudies_II = '통합사회2',

  // 일반 선택
  GlobalCitizenshipAndGeography = '세계시민과 지리',
  WorldHistory = '세계사',
  SocietyAndCulture = '사회와 문화',

  // 진로 선택
  ExploringKoreanGeography = '한국지리 탐구',
  ExploringFutureOfCities = '도시의 미래 탐구',
  JourneyThroughEastAsianHistory = '동아시아 역사 기행',
  Politics = '정치',
  LawAndSociety = '법과 사회',
  Economics = '경제',
  EthicsAndPhilosophy = '윤리와 사상',
  HumanitiesAndEthics = '인문학과 윤리',
  UnderstandingInternationalRelations = '국제 관계의 이해',

  // 진로 선택 (특목고)
  AdvancedPhysics = '고급 물리학',
  AdvancedChemistry = '고급 화학',
  AdvancedBiology = '고급 생명과학',
  AdvancedEarthScience = '고급 지구과학',
  ScienceProjectResearch = '과학과제 연구',

  // 융합 선택
  TravelGeography = '여행지리',
  ExploringModernWorldThroughHistory = '역사로 탐구하는 현대 세계',
  InvestigatingSocialIssues = '사회문제 탐구',
  FinanceAndEconomicLife = '금융과 경제생활',
  ExploringEthicalIssues = '윤리문제 탐구',
  ClimateChangeAndSustainableWorld = '기후변화와 지속가능한 세계',

  // 융합 선택 (특목고)
  PhysicsExperiment = '물리학 실험',
  ChemistryExperiment = '화학',
  BiologyExperiment = '생명과학 실험',
  EarthScienceExperiment = '지구과학 실험',
}

export enum ScienceSubjects {
  // 공통 과목
  IntegratedScience_I = '통합과학1',
  IntegratedScience_II = '통합과학2',
  ScienceInquiryAndExperiment_I = '과학탐구실험1',
  ScienceInquiryAndExperiment_II = '과학탐구실험2',

  // 일반 선택
  Physics = '물리학',
  Chemistry = '화학',
  Biology = '생명과학',
  EarthScience = '지구과학',

  // 진로 선택
  DynamicsAndEnergy = '역학과 에너지',
  ElectromagnetismAndQuantumPhysics = '전자기와 양자',
  MatterAndEnergy = '물질과 에너지',
  WolrdOfChemicalReactions = '화학 반응의 세계',
  CellsAndMetabolism = '세포와 물질대사',
  GeneticsOfOrganisms = '생물의 유전',
  EarthSystemScience = '지구시스템과학',
  PlanetaryAndSpaceScience = '행성우주과학',

  // 융합 선택
  HistoryAndCultureOfScience = '과학의 역사와 문화',
  ClimateChangeAndEnvironmentalEcology = '기후변화와 환경생태',
  ExploringIntegratedScience = '융합과학 탐구',
}

export enum PhysicalEducationSubjects {
  // 일반 선택
  PhysicalEducation_I = '체육1',
  PhysicalEducation_II = '체육2',

  // 진로 선택
  ExerciseAndHealth = '운동과 건강',
  SportsCulture = '스포츠 문화',
  SportsScience = '스포츠 과학',

  // 진로 선택 (특목고)
  IntroductionToSports = '스포츠 개론',
  TrackAndField = '육상',
  Gymnastics = '체조',
  WaterSports = '수상 스포츠',
  BasicPhysicalEducationPracticum = '기초 체육 전공 실기',
  AdvancedPhysicalEducationPracticum = '심화 체육 전공 실기',
  HigherLevelPhysicalEducationPracticum = '고급 체육 전공 실기',
  SportsGameFitness = '스포츠 경기 체력',
  SportsGameTechniques = '스포츠 경기 기술',
  SportsGameAnalysis = '스포츠 경기 분석',

  // 융합 선택
  SportsLife_I = '스포츠 생활1',
  SportsLife_II = '스포츠 생활2',

  // 융합 선택 (특목고)
  SportsEducation = '스포츠 교육',
  SportsPhysiology = '스포츠 생리의학',
  SportsAdministrationAndManagement = '스포츠 행정 및 경영',
}

export enum ArtSubjects {
  // 일반 선택
  Music = '음악',
  FineArts = '미술',
  Drama = '연극',

  // 진로 선택
  MusicPerformanceAndCreation = '음악 연주와 창작',
  MusicAppreciationandCriticism = '음악 감상과 비평',
  ArtCreation = '미술 창작',
  ArtAppreciationAndCriticism = '미술 감상과 비평',

  // 진로 선택 (특목고)
  MusicTheory = '음악 이론',
  MusicHistory = '음악사',
  VocalAndAuralSkills = '시창﹒청음',
  MusicPerformancePractive = '음악 전공 실기',
  ChorusAndEnsemble = '합창﹒합주',
  MusicPerformancePractice = '음악 공연 실습',
  ArtTheory = '미술 이론',
  Drawing = '드로잉',
  ArtHistory = '미술사',
  ArtPerformancePractice = '미술 전공 실기',
  SculptureExploration = '조형 탐구',
  UnderstandingDance = '무용의 이해',
  DanceAndBody = '무용과 몸',
  BasicDancePracticum = '무용 기초 실기',
  DancePerformancePractice = '무용 전공 실기',
  Choreography = '안무',
  DanceProductionPractice = '무용 제작 실습',
  DanceAppreciationAndCriticism = '무용 감상과 비평',
  UnderstandingLiteraryCreation = '문예 창작의 이해',
  Rhetoric = '문장론',
  LiteraryAppreciationAndCriticism = '문학 감상과 비평',
  PoetryWriting = '시 창작',
  NovelWriting = '소설 창작',
  Playwriting = '극 창작',
  TheaterAndBody = '연극과 몸',
  TheaterAndSpeech = '연극과 말',
  Acting = '연기',
  StageArtAndTechnology = '무대 미술과 기술',
  TheaterProductionPractice = '연극 제작 실습',
  TheaterAppreciationAndCriticism = '연극 감상과 비평',
  UnderstandingFilm = '영화의 이해',
  CinematographyAndLighting = '촬영﹒조명',
  EditingAndSound = '편집﹒사운드',
  FilmProductionPractice = '영화 제작 실습',
  FilmAppreciationAndCriticism = '영화 감상과 비평',
  UnderstandingPhotography = '사진의 이해',
  PhotographyTechniques = '사진 촬영',
  PhotographicExpressionTechniques = '사진 표현 기법',
  UnderstandingVideoProduction = '영상 제작의 이해',
  PhotographyAppreciationAndCriticism = '사진 감상과 비평',

  // 융합 선택
  MusicAndMedia = '음악과 미디어',
  ArtAndMedia = '미술과 매체',

  // 융합 선택 (특목고)
  MusicAndCulture = '음악과 문화',
  ArtMediaExploration = '미술 매체 탐구',
  ArtAndSociety = '미술과 사회',
  DanceAndMedia = '무용과 매체',
  LiteratureAndMedia = '문학과 매체',
  TheaterAndLife = '연극과 삶',
  FilmAndLife = '영화와 삶',
  PhotographyAndLife = '사진과 삶',
}

export enum TechnologyAndHomeEconomicsSubjects {
  // 일반 선택
  TechnologyAndHomeEconomics = '기술﹒가정',

  // 진로 선택
  RoboticsAndEngineeringWorld = '로봇과 공학세계',
  ExploringHomeEconomics = '생활과학 탐구',

  // 융합 선택
  CreativeEngineeringDesign = '창의 공학 설계',
  GeneralIntellectualProperty = '지식 재산 일반',
  LifeDesignAndIndependence = '생애 설계와 자립',
  ChildDevelopmentAndParenting = '아동발달과 부모',
}

export enum InformationSubjects {
  // 일반 선택
  Information = '정보',

  // 진로 선택
  FundamentalsOfArtificialIntelligence = '인공지능 기초',
  DataScience = '데이터 과학',

  // 진로 선택 (특목고)
  ComputerScience = '정보과학',

  // 융합 선택
  SoftwareAndLife = '소프트웨어와 생활',
}

export enum SecondForeignLanguageSubjects {
  // 일반 선택
  German = '독일어',
  French = '프랑스어',
  Spanish = '스페인어',
  Chinese = '중국어',
  Japanese = '일본어',
  Russian = '러시아어',
  Arabic = '아랍어',
  Vietnamese = '베트남어',

  // 진로 선택
  GermanConversation = '독일어 회화',
  FrenchConversation = '프랑스어 회화',
  SpanishConversation = '스페인어 회화',
  ChineseConversation = '중국어 회화',
  JapaneseConversation = '일본어 회화',
  RussianConversation = '러시아어 회화',
  ArabicConversation = '아랍어 회화',
  VietnameseConversation = '베트남어 회화',
  AdvancedGerman = '심화 독일어',
  AdvancedFrench = '심화 프랑스어',
  AdvancedSpanish = '심화 스페인어',
  AdvancedChinese = '심화 중국어',
  AdvancedJapanese = '심화 일본어',
  AdvancedRussian = '심화 러시아어',
  AdvancedArabic = '심화 아랍어',
  AdvancedVietnamese = '심화 베트남어',

  // 융합 선택
  GermanSpeakingCulture = '독일어권 문화',
  FrenchSpeakingCulture = '프랑스어권 문화',
  SpanishSpeakingCulture = '스페인어권 문화',
  ChineseCulture = '중국 문화',
  JapaneseCulture = '일본 문화',
  RussianCulture = '러시아 문화',
  ArabicCulture = '아랍 문화',
  VietnameseCulture = '베트남 문화',
}

export enum ChineseCharacterAndClassicsSubjects {
  // 일반 선택
  ClassicalChinese = '한문',

  // 진로 선택
  ReadingClassicalChineseLiterature = '한문 고전 읽기',

  // 융합 선택
  LanguageUseAndHanja = '언어생활과 한자',
}

export enum LiberalArtsSubjects {
  // 일반 선택
  CarrerAndOccupation = '진로와 직업',
  EcologyAndEnvironment = '생태와 환경',

  // 진로 선택
  HumanAndPhilosophy = '인간과 철학',
  LoginAndThinking = '논리와 사고',
  HumanAndPsycology = '인간과 심리',
  UnderstandingEducation = '교육의 이해',
  LifeAndReligion = '삶과 종교',
  Health = '보건',

  // 융합 선택
  HumandAndEconomicActivities = '인간과 경제활동',
  EssayWriting = '논술',
}

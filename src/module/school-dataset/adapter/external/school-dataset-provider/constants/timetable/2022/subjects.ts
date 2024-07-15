import {
  SubjectCategory_General,
  SubjectCategory_Specialized,
} from './subject-categories';
import {
  KoreanLanguageSubjects,
  MathematicsSubjects,
  EnglishSubjects,
  SocialStudiesSubjects,
  ScienceSubjects,
  PhysicalEducationSubjects,
  ArtSubjects,
  TechnologyAndHomeEconomicsSubjects,
  InformationSubjects,
  SecondForeignLanguageSubjects,
  ChineseCharacterAndClassicsSubjects,
  LiberalArtsSubjects,
} from './subjects-general';
import {
  BusinessAndFinanceSubjects,
  HealthAndWelfareSubjects,
  CultureArtsDesignBroadcastingSubjects,
  CosmetologySubjects,
  TourismAndLeisureSubjects,
  FoodAndCulinaryArtsSubjects,
  ArchitectureAndCivilEngineeringSubjects,
  MechanicalEngineeringSubjects,
  MaterialsScienceSubjects,
  ChemicalIndustrySubjects,
  TextilesAndApparelSubjects,
  ElectricalAndElectronicsSubjects,
  InformationAndCommunicationTechnologySubjects,
  EnvironmentalSafetyAndFireProtectionSubjects,
  AgricultureAndAnimalHusbandrySubjects,
  FisheriesAndMaritimeAffairsSubjects,
  ConvergenceAndIntellectualPropertySubjects,
} from './subjects-specialized';

// 모든 교과목
export const Subjects: {
  [key in SubjectCategory_General | SubjectCategory_Specialized]: string[];
} = {
  국어: Object.values(KoreanLanguageSubjects),
  수학: Object.values(MathematicsSubjects),
  영어: Object.values(EnglishSubjects),
  사회: Object.values(SocialStudiesSubjects),
  과학: Object.values(ScienceSubjects),
  체육: Object.values(PhysicalEducationSubjects),
  예술: Object.values(ArtSubjects),
  ['기술﹒가정']: Object.values(TechnologyAndHomeEconomicsSubjects),
  정보: Object.values(InformationSubjects),
  제2외국어: Object.values(SecondForeignLanguageSubjects),
  한문: Object.values(ChineseCharacterAndClassicsSubjects),
  교양: Object.values(LiberalArtsSubjects),
  ['경영﹒금융']: Object.values(BusinessAndFinanceSubjects),
  ['보건﹒복지']: Object.values(HealthAndWelfareSubjects),
  ['문화﹒예술﹒디자인﹒방송']: Object.values(
    CultureArtsDesignBroadcastingSubjects,
  ),
  미용: Object.values(CosmetologySubjects),
  ['관광﹒레저']: Object.values(TourismAndLeisureSubjects),
  ['식품﹒조리']: Object.values(FoodAndCulinaryArtsSubjects),
  ['건축﹒토목']: Object.values(ArchitectureAndCivilEngineeringSubjects),
  기계: Object.values(MechanicalEngineeringSubjects),
  재료: Object.values(MaterialsScienceSubjects),
  ['화학 공업']: Object.values(ChemicalIndustrySubjects),
  ['섬유﹒의류']: Object.values(TextilesAndApparelSubjects),
  ['전기﹒전자']: Object.values(ElectricalAndElectronicsSubjects),
  ['정보﹒통신']: Object.values(InformationAndCommunicationTechnologySubjects),
  ['환경﹒안전﹒소방']: Object.values(
    EnvironmentalSafetyAndFireProtectionSubjects,
  ),
  ['농림﹒축산']: Object.values(AgricultureAndAnimalHusbandrySubjects),
  ['수산﹒해운']: Object.values(FisheriesAndMaritimeAffairsSubjects),
  ['융복합﹒지식 재산']: Object.values(
    ConvergenceAndIntellectualPropertySubjects,
  ),
} as const;

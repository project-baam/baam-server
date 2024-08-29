export function getInitialAndSortKey(name: string): {
  initial: string;
  sortKey: string;
} {
  const firstChar = name.charAt(0);
  const unicode = firstChar.charCodeAt(0);

  // 한글 처리
  if (unicode >= 44032 && unicode <= 55203) {
    const initialCode = Math.floor((unicode - 44032) / 588) + 4352;
    const initial = String.fromCharCode(initialCode);

    return { initial, sortKey: `1${initialCode}${name}` }; // 초성, 자음이 다르게 취급되어서 코드를 사용
  }

  // 영어 및 기타 문자
  const uppercaseChar = firstChar.toUpperCase();
  return { initial: uppercaseChar, sortKey: `2${uppercaseChar}${name}` };
}

export function convertSearchInitialToDBInitial(searchInitial: string): number {
  const unicode = searchInitial.charCodeAt(0);

  // 자음 'ㄱ'(12593) ~ 'ㅎ'(12622) 을 초성 'ᄀ'(4352) ~ 'ᄒ'(4370) 으로 변환
  if (unicode >= 12593 && unicode <= 12622) {
    return unicode - 12593 + 4352;
  }

  // 이미 초성이거나 다른 문자인 경우 그대로 반환
  return unicode;
}

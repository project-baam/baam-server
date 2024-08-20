export const PROFILE_IMAGE_FIELDS = {
  PROFILE: 'profileImage',
  BACKGROUND: 'backgroundImage',
} as const;

export type ProfileImageField =
  (typeof PROFILE_IMAGE_FIELDS)[keyof typeof PROFILE_IMAGE_FIELDS];

export const MAX_PROFILE_IMAGES = 2;

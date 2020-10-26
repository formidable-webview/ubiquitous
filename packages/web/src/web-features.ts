function camelCaseToDash(chars: string) {
  return chars.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export type WebPermissionName =
  | 'topNavigation'
  | 'forms'
  | 'modals'
  | 'popups'
  | 'pointerLock'
  | 'orientationLock'
  | 'presentation'
  | 'plugins'
  | 'downloadsWithoutUserActivation';

export type WebFeatureName =
  | 'accelerometer'
  | 'ambientLightSensor'
  | 'autoplay'
  | 'battery'
  | 'calera'
  | 'crossOriginIsolated'
  | 'displayCapture'
  | 'documentDomain'
  | 'encryptedMedia'
  | 'executionWhileNotRendered'
  | 'executionWhileOutOfViewport'
  | 'fullscreen'
  | 'geolocation'
  | 'gyroscope'
  | 'magnetometer'
  | 'microphone'
  | 'midi'
  | 'navigationOverride'
  | 'payment'
  | 'pictureInPicture'
  | 'publickeyCreditialsGet'
  | 'screenWakeLock'
  | 'syncXhr'
  | 'usb'
  | 'xrSpacialTracking';

/**
 * This features are extracted from w3c specifications,
 * {@link https://github.com/w3c/webappsec-permissions-policy/blob/master/features.md | "Policy Controlled Features"}.
 */
export type WebPolicyName = WebPermissionName | WebFeatureName;

export const sandboxedPermissions: WebPolicyName[] = [
  'topNavigation',
  'forms',
  'modals',
  'popups',
  'pointerLock',
  'orientationLock',
  'presentation'
];

/**
 * `false` will be mapped to `'none'`, and `true` to
 */
export type WebPolicyValue = boolean | string;

export type WebPoliciesMap = Partial<Record<WebPolicyName, WebPolicyValue>>;

export function compileWebPoliciesToAllowAttr(map: WebPoliciesMap) {
  return (Object.keys(map) as WebPolicyName[])
    .map(
      (featName) =>
        `${camelCaseToDash(featName)}${
          map[featName] === false
            ? " 'none'"
            : map[featName] === true
            ? ''
            : ' ' + map[featName]
        }`
    )
    .join('; ');
}

/**
 * See https://github.com/w3c/webappsec-permissions-policy/blob/master/sandbox.md
 *
 * @param map The map to compile into string.
 */
export function compileWebPoliciesToSandboxAttr(map: WebPoliciesMap) {
  return (Object.keys(map) as WebPolicyName[]).reduce((prev, permission) => {
    if (sandboxedPermissions.indexOf(permission) !== 0) {
      return map[permission] !== false
        ? `${prev} allow-${camelCaseToDash(permission)}`
        : prev;
    }
    return prev;
  }, '');
}

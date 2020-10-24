function camelCaseToDash(chars: string) {
  return chars.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * This features are extracted from w3c specifications,
 * {@link https://github.com/w3c/webappsec-permissions-policy/blob/master/features.md | "Policy Controlled Features"}.
 */
export type WebPermissionName =
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
 * `false` will be mapped to `'none'`, and `true` to
 */
export type WebPermissionPolicy = boolean | string;

export type WebPermissionPoliciesMap = Partial<
  Record<WebPermissionName, WebPermissionPolicy>
>;

/**
 * @param policiesMap - a list of feature maps which will be shallow-merged
 * from left to right.
 */
export function compileWebPermissionsPolicies(
  ...policiesMap: WebPermissionPoliciesMap[]
) {
  const features = Object.assign({}, ...policiesMap);
  return (Object.keys(features) as WebPermissionName[])
    .map(
      (featName) =>
        `${camelCaseToDash(featName)}${
          features[featName] === false
            ? " 'none'"
            : features[featName] === true
            ? ''
            : ' ' + features[featName]
        }`
    )
    .join('; ');
}

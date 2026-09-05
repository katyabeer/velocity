/**
 * The three sign-up marks: Apple, Google, and an envelope for email.
 *
 * WHY THEY ARE PATHS AND NOT PNGs. Apple's and Google's are supplied as SVG
 * (Katya, 4 Sep) and both are brand assets with exact geometry — rasterising
 * them would mean shipping three densities and still getting soft edges at the
 * 22pt they render at. `react-native-svg` was already a dependency.
 *
 * ⚠ APPLE'S AND GOOGLE'S MARKS ARE TRADEMARKS, reproduced here unmodified and
 * at the colours supplied. That is what their sign-in guidelines require and
 * it is the only reason they are exempt from this design's own palette — do
 * NOT restyle them to the cream/ink tokens, tint them, or set them in the
 * accent. If a mark has to change, replace the asset rather than recolouring
 * the path.
 *
 * THE ENVELOPE IS OURS, so it is the opposite: drawn on the same 24 grid but
 * stroked in `currentColor` so it takes the row's ink like every other line in
 * the app. It is deliberately the plainest of the three — email is the
 * fallback method, and a third logo-shaped thing would give it a weight the
 * other two have earned and it has not.
 */

import Svg, { Path, Rect } from 'react-native-svg';
import { palette } from '@/theme/tokens';

/** All three are drawn on Apple's and Google's shared 24×24 viewBox, so one
 *  size prop keeps the optical weights matched. */
const BOX = 24;

export function AppleMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${BOX} ${BOX}`}>
      <Path
        d="M16.0469 5.57227C16.2474 5.57227 16.5892 5.60417 17.0723 5.66797C17.5553 5.73177 18.084 5.91406 18.6582 6.21484C19.2415 6.50651 19.7702 6.99414 20.2441 7.67773C20.2168 7.70508 20.0846 7.80534 19.8477 7.97852C19.6107 8.14258 19.3464 8.38867 19.0547 8.7168C18.763 9.03581 18.5078 9.44596 18.2891 9.94727C18.0703 10.4395 17.9609 11.0273 17.9609 11.7109C17.9609 12.4948 18.0977 13.1602 18.3711 13.707C18.6536 14.2539 18.9772 14.696 19.3418 15.0332C19.7155 15.3613 20.0436 15.6029 20.3262 15.7578C20.6178 15.9128 20.7728 15.9948 20.791 16.0039C20.7819 16.0404 20.6634 16.3639 20.4355 16.9746C20.2168 17.5853 19.8522 18.2643 19.3418 19.0117C18.8952 19.6589 18.4121 20.2559 17.8926 20.8027C17.3822 21.3496 16.7669 21.623 16.0469 21.623C15.5638 21.623 15.1673 21.5547 14.8574 21.418C14.5475 21.2721 14.2285 21.1309 13.9004 20.9941C13.5723 20.8483 13.1302 20.7754 12.5742 20.7754C12.0365 20.7754 11.5853 20.8483 11.2207 20.9941C10.8652 21.14 10.5234 21.2858 10.1953 21.4316C9.8763 21.5775 9.49805 21.6504 9.06055 21.6504C8.39518 21.6504 7.81185 21.3861 7.31055 20.8574C6.80924 20.3288 6.29427 19.6953 5.76562 18.957C5.15495 18.082 4.63086 17.0156 4.19336 15.7578C3.76497 14.4909 3.55078 13.2148 3.55078 11.9297C3.55078 10.5534 3.81055 9.40039 4.33008 8.4707C4.84961 7.5319 5.51497 6.82552 6.32617 6.35156C7.14648 5.86849 7.99414 5.62695 8.86914 5.62695C9.33398 5.62695 9.77148 5.70443 10.1816 5.85938C10.5918 6.00521 10.9746 6.1556 11.3301 6.31055C11.6947 6.46549 12.0228 6.54297 12.3145 6.54297C12.597 6.54297 12.9251 6.46094 13.2988 6.29688C13.6725 6.13281 14.0918 5.97331 14.5566 5.81836C15.0215 5.6543 15.5182 5.57227 16.0469 5.57227ZM15.2949 3.83594C14.9395 4.26432 14.4928 4.62435 13.9551 4.91602C13.4173 5.19857 12.9069 5.33984 12.4238 5.33984C12.3236 5.33984 12.2279 5.33073 12.1367 5.3125C12.1276 5.28516 12.1185 5.23503 12.1094 5.16211C12.1003 5.08919 12.0957 5.01172 12.0957 4.92969C12.0957 4.38281 12.2142 3.85417 12.4512 3.34375C12.6882 2.82422 12.957 2.39583 13.2578 2.05859C13.6406 1.60286 14.1237 1.22461 14.707 0.923828C15.2904 0.623047 15.8464 0.463542 16.375 0.445312C16.4023 0.563802 16.416 0.705078 16.416 0.869141C16.416 1.41602 16.3112 1.94922 16.1016 2.46875C15.8919 2.97917 15.623 3.4349 15.2949 3.83594Z"
        fill={palette.ink}
      />
    </Svg>
  );
}

export function GoogleMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${BOX} ${BOX}`}>
      <Path
        d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
        fill="#4285F4"
      />
      <Path
        d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13999 18.63 6.70999 16.7 5.83999 14.1H2.17999V16.94C3.98999 20.53 7.69999 23 12 23Z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.07H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.03 14.71L5.84 14.09Z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.69999 1 3.98999 3.47 2.17999 7.07L5.83999 9.91C6.70999 7.31 9.13999 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </Svg>
  );
}

/**
 * Ours. A rectangle and the flap, nothing else — the same hairline weight the
 * app rules everything else with, so it sits at the optical weight of the two
 * logos above it without pretending to be one.
 */
export function EmailMark({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${BOX} ${BOX}`} fill="none">
      <Rect
        x={2.5}
        y={5}
        width={19}
        height={14}
        rx={1.5}
        stroke={palette.ink}
        strokeWidth={1.8}
      />
      <Path
        d="M3 6.5L12 13L21 6.5"
        stroke={palette.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

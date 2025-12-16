import { TailSpin } from "react-loader-spinner";

/**
 * Props:
 * - size: número (px)
 * - color: string (color CSS)
 * - fullScreen: boolean
 */
export default function Loading({
    size = 40,
    color = "#259073",
    fullScreen = false,
}) {
    const spinner = (
        <TailSpin
            height={size}
            width={size}
            color={color}
            ariaLabel="loading"
        />
    );

    if (fullScreen) {
        return (
            <div className="loading-fullscreen">
                {spinner}
            </div>
        );
    }

    return (
        <div className="loading-container">
            {spinner}
        </div>
    );
}

import { TailSpin } from "react-loader-spinner";

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

    const containerClass = fullScreen ? "loading-fullscreen" : "loading-container";

    return (
        <div className={containerClass}>
            <TailSpin
                height={size}
                width={size}
                color={color}
                ariaLabel="loading"
            />
        </div>
    );
}

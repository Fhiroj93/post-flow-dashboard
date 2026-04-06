interface Props { progress: number }

const ProgressBar = ({ progress }: Props) => (
  <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
    <div
      className="h-full bg-primary transition-all duration-100 ease-linear"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default ProgressBar;

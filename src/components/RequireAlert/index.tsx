const RequireAlert = ({
  className = "",
  value,
  text,
}: {
  className?: string;
  value?: string | boolean;
  text?: string;
}) => (!value ? <div className={`${className} mt-1 text-xs text-danger`}>*{text}</div> : <div />);

export default RequireAlert;

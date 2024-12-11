type ButtonProps = {
  func: () => void;
  title: string;
  bgColor: string;
  textColor: string;
  mt: string;
  border: string;
};

function Button({ func, title, bgColor, textColor, mt, border }: ButtonProps) {
  return (
    <button
      className={`mx-auto mt-${mt} p-3 bg-${bgColor} text-${textColor} border border-${border} rounded-lg w-full h-full`}
      onClick={func}
    >
      {title}
    </button>
  );
}

export default Button;

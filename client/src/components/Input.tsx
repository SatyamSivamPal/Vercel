type InputProps = {
  placeholder: string;
  type: string;
  disabled: boolean;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const Input = (props: InputProps) => {
  return (
    <div>
      <input
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${props.disabled ? 'cursor-not-allowed opacity-50' : 'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium'} `}
        type={props.type}
        placeholder={props.placeholder}
        disabled={props.disabled}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
};

export default Input;

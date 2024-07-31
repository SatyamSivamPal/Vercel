type buttonProps = {
    children: React.ReactNode;
    onClick: React.MouseEventHandler<HTMLButtonElement>
    disabled: boolean;
}

const Button = (props: buttonProps) => {
  return (
    <div>
       <button onClick={props.onClick} className="flex justify-center items-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'bg-primary text-primary-foreground border border-input bg-background px-3 py-2 hover:bg-primary/90 focus:ring-primary">
            {props.children}
       </button>
    </div>
  )
}

export default Button
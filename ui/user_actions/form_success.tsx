export function FormSuccess ({show}: {show: boolean}) {
    if (show) return (
        <div className="text-success font-semibold text-xs flex flex-col g-1 p-0 m-0">
            Success!
        </div>
    )
    return (<></>)
}

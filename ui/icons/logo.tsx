import Image from 'next/image'

export function Logo({width}: {width: number}) {
    return ( <div className='w-fit m-1'><Image src={"/logo.svg"} alt={"Logo"} width={width} height={width / 2.897}/></div>
    )
}

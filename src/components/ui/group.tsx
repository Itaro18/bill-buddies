import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Group({title,grpId,total}:{title:string,grpId:string,total:number}){
    const router = useRouter()
    return <div  onClick={()=>{
       router.push(`/group/${grpId}`)
        
    }} className=" cursor-pointer border-2 border-slate-700 dark:border-white w-full max-w-2xl grid grid-cols-4 gap-9 p-2 items-center rounded-md my-4 mx-auto">
        <div className="w-12 sm:w-28 relative aspect-square rounded-sm overflow-hidden ">
            <Image
            src="/image.png"
            alt="group-icon"
            fill
            // sizes="(max-width: 700px) 25vw, 175px"
            className="object-cover"
            />
        </div>
        <div className='col-span-3'>
            <h1 className='text-xl sm:text-2xl text-red-600 mb-1'>{title}</h1>
            {total > 0 ? (
                <p className="text-xl text-green-400 sm:text-2xl">
                You are owed {(total / 100).toFixed(2)} overall
                </p>
            ) : total === 0 ? (
                <p className="text-xl text-slate-400 sm:text-2xl">
                You are all settled up
                </p>
            ) : (
                <p className="text-xl text-red-400 sm:text-2xl">
                You owe {((-1 * total) / 100).toFixed(2)} overall
                </p>
            )}
        </div>
    </div>
}
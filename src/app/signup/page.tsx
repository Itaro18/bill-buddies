import {Signup} from '@/components/Signup';
import { getServerSession} from "next-auth";
import { Redirect } from '@/components/Redirect';

const  SignupPage =async ()=>{
    const session = await getServerSession();
    if (session) {
        return <Redirect to={'/dashboard'} />;
    }
    return <Signup/>
}

export default SignupPage;
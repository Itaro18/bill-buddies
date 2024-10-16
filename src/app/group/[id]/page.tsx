import GroupPage from "@/components/GroupPage";
import { getServerSession } from "next-auth";
import { Redirect } from "@/components/Redirect";
import Menubar from "@/components/Menubar";
import { PrismaClient } from "@prisma/client";

export default async function Group({ params }: { params: { id: string } }) {
  const session = await getServerSession();

  if (!session?.user) {
    return <Redirect to={"/"} />;
  }

  const prisma = new PrismaClient();

  const verify = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      groups: {
        where: { id: params.id },
      },
    },
  });

  if (!verify?.groups.length) {
    return (
      <p className="mt-10">
        You dont have acess to this grp pls Signin with Correct accout :({" "}
      </p>
    );
  }

  const content = await prisma.group.findUnique({
    where: {
      id: params.id,
    },
    include: {
      users: {
        select: {
          name: true,
          email: true,
          id: true,
        },
      },
    },
  });

  return (
    <div className="flex w-full justify-center ">
      <Menubar />
      <GroupPage
        title={content?.name || " "}
        users={content?.users || []}
        id={params.id || ""}
      />
    </div>
  );
}

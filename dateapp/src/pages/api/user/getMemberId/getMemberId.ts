import { db } from "src/lib/db";

export const getMemberId = async (userId: string) => {
  const member = await db.user.findFirst({
    where: {id: userId},
    include: { member: true },
  });
  if(member?.member[0]?.id !== undefined){  
    return member?.member[0]?.id;
  }else{
    const newMember = await db.member.create({
        data:{
          userId: userId,
        }
    });
    return newMember.id ;
  }
}
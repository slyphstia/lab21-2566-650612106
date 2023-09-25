import { checkToken } from "@/libs/checkToken";
import { getPrisma } from "@/libs/getPrisma";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const payload = checkToken();
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  const { role, studentId } = payload;

  if (role === "ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only Student can access this API route",
      },
      { status: 403 }
    );
  }

  const prisma = getPrisma();
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
    },
    include: {
      course: true,
    },
    orderBy: {
      courseNo: "asc",
    },
  });

  return NextResponse.json({
    ok: true,
    enrollments,
  });
};

export const POST = async (request) => {
  const payload = checkToken();
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  const { role, studentId } = payload;

  if (role === "ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only Student can access this API route",
      },
      { status: 403 }
    );
  }

  //read body request & validate it
  const body = await request.json();
  const { courseNo } = body;
  if (typeof courseNo !== "string" || courseNo.length !== 6) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo must contain 6 characters",
      },
      { status: 400 }
    );
  }

  const prisma = getPrisma();
  //1.check if courseNo does not exist on database
  const checkCourseNo = await prisma.course.findMany({
    where: { courseNo: courseNo }
  });
  if (checkCourseNo.length ===0){
    return NextResponse.json(
    {
      ok: false,
      message: "Course number does not exist",
    },
    { status: 400 }
  );
  }
  
  const checkEnroll = await prisma.enrollment.findMany({
    where: {studentId , courseNo}
  })
if(checkEnroll.length > 0){
  return NextResponse.json(
    {
      ok: false,
      message: "You already registered this course",
    },
    { status: 400 }
  );
}

  //send this response back if courseNo does not exist
  // 

  //2.check if such student enroll that course already (both "studentId" and "courseNo" exists on enrollment collection)
  
  // 

  //3.if conditions above are not met, perform inserting data here
  const enroll = await prisma.enrollment.create({
    data:{studentId,courseNo

    }
  })
  // await prisma.enrollment.create({
  //   data:{
  //     ...
  //   }
  // })

  return NextResponse.json({
    ok: true,
    message: "You has enrolled a course successfully",
    enroll
  });
};

export const DELETE = async (request) => {
  const payload = checkToken();
  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  const { role, studentId } = payload;

  if (role === "ADMIN") {
    return NextResponse.json(
      {
        ok: true,
        message: "Only Student can access this API route",
      },
      { status: 403 }
    );
  }

  //read body request
  const body = await request.json();
  const { enrollmentId } = body;
  if (typeof enrollmentId !== "string") {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid enrollmentId",
      },
      { status: 400 }
    );
  }

  const prisma = getPrisma();

  try {
    await prisma.enrollment.delete({
      where: {
        id: enrollmentId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "You cannot drop from this course. You have not enrolled it yet!",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "You has dropped from this course. See you next semester.",
  });
};

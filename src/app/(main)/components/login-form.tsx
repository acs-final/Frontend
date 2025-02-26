import Image from "next/image";
import Link from "next/link";
import { cn } from "@/app/(main)/lib/utils"
import { Button } from "@/app/(main)/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/(main)/components/ui/card"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              {/* <div className="grid gap-2"> */}
                {/* <Label htmlFor="email">Email</Label> */}
                {/* <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                /> */}
              {/* </div> */}
              {/* <div className="grid gap-2"> */}
                {/* <div className="flex items-center"> */}
                  {/* <Label htmlFor="password">Password</Label> */}
                  {/* <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  > */}
                    {/* Forgot your password? */}
                  {/* </a> */}
                {/* </div> */}
                {/* <Input id="password" type="password" required /> */}
              {/* </div> */}
              {/* <Button type="submit" className="w-full"> */}
                {/* Login */}
              {/* </Button> */}
              <Button 
                asChild 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <Link href="/cognito">

                Login with Cognito ( Google )
                </Link>
              </Button>
              {/* <Button variant="outline" className="w-full">
              <Image 
                  src="/kakao.png" 
                  alt="카카오 로고" 
                  width={20} 
                  height={20} 
                />
                Login with kakaotalk
              </Button> */}
            </div>
            {/* <div className="mt-4 text-center text-sm"> */}
              {/* Don&apos;t have an account?{" "} */}
              {/* <a href="#" className="underline underline-offset-4">
                Sign up
              </a> */}
            {/* </div> */}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

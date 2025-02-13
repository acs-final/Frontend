"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useDarkMode } from "@/hooks/useDarkMode"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 사용자 정보를 state로 관리합니다.
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg",
  })

  // 사용자 정보를 세션 스토리지에서 불러오는 함수
  const loadUserFromSession = React.useCallback(() => {
    const sub = sessionStorage.getItem("sub")
    const username = sessionStorage.getItem("username")
    setUser({
      name: sub || "MOAI",
      email: username || "RAPA Delta",
      avatar: "/avatars/shadcn.jpg",
    })
  }, [])

  // 컴포넌트가 마운트될 때 및 sessionCleared 이벤트 발생 시 사용자 정보를 불러옵니다.
  React.useEffect(() => {
    // 초기 로드
    loadUserFromSession()

    // sessionCleared 이벤트 구독
    const handleSessionCleared = () => {
      loadUserFromSession()
    }
    window.addEventListener("sessionCleared", handleSessionCleared)

    // 클린업
    return () => {
      window.removeEventListener("sessionCleared", handleSessionCleared)
    }
  }, [loadUserFromSession])

  // 다크 모드 여부 감지
  const isDarkMode = useDarkMode()
  
  // 디버깅을 위한 콘솔 로그 추가
  React.useEffect(() => {
    console.log("다크모드 상태:", isDarkMode)
  }, [isDarkMode])

  const data = {
    user,
    navMain: [
      {
        title: "동화책 만들기",
        url: "/createbook",
        icon: Bot,
        isActive: true,
      },
      {
        title: "내 책방",
        url: "/mybookstore",
        icon: BookOpen,
      },
      {
        title: "자유게시판",
        url: "/board",
        icon: SquareTerminal,
      },
      {
        title: "도서추천",
        url: "/recommended",
        icon: Settings2,
      },
    ],
    navSecondary: [
      {
        title: "고객지원",
        url: "/support",
        icon: LifeBuoy,
      },
      {
        title: "개인정보처리방침",
        url: "/privacy-policy",
        icon: Send,
      },
    ],
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex items-center justify-start w-full">
                  <img
                    src={isDarkMode ? "/moai_dark.png" : "/moai.png"}
                    alt="Moai Logo"
                    className="w-[70%] h-auto"
                  />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

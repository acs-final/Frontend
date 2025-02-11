"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// FAQ 아코디언 관련 컴포넌트 (사용 중인 UI 라이브러리에 맞게 수정)
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// 문의하기 폼 관련 UI 컴포넌트
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// ----------------------------------------------------------------------
// 1. 문의하기 폼 스키마 정의 (Zod를 이용한 유효성 검사)
const contactFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  message: z.string().min(1, "문의하실 내용을 입력해주세요."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// ----------------------------------------------------------------------
// 2. FAQ 데이터 배열 (예시 데이터)
const faqData = [
  {
    question: "문의하기 관련하여 어떻게 연락할 수 있나요?",
    answer:
      "문의 사항이 있으신 경우, 아래 문의하기 폼을 통해 연락해주시면 신속하게 답변드리겠습니다.",
  },
  {
    question: "답변은 얼마나 걸리나요?",
    answer:
      "일반적으로 문의 접수 후 2-3일 이내에 답변을 드리고 있습니다.",
  },
  {
    question: "어떤 문의를 할 수 있나요?",
    answer:
      "서비스 관련 문의, 오류 신고, 건의사항 등 다양한 문의를 보내실 수 있습니다.",
  },
];

// ----------------------------------------------------------------------
// 3. ContactPage 컴포넌트 (FAQ 아코디언 + 문의하기 폼)
export default function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  // 문의 폼 제출 핸들러
  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
        form.reset();
      } else {
        alert("문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("문의 전송 중 에러:", error);
      alert("문의 전송 중 에러가 발생했습니다.");
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* FAQ 아코디언 섹션 */}
        <div className="p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">자주 묻는 질문 (FAQ)</h2>
          <Accordion type="multiple" className="space-y-2">
            {faqData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* 문의하기 폼 섹션 */}
        <div className="p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">문의하기</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 이름 입력 필드 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="이름을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 이메일 입력 필드 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input placeholder="이메일을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 문의 내용 입력 필드 */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문의 내용</FormLabel>
                    <FormControl>
                      <Textarea placeholder="문의하실 내용을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제출 버튼 */}
              <div className="flex justify-center">
                <Button type="submit">문의 보내기</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}

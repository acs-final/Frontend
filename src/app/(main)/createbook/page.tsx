"use client";

import { useState, useEffect, Suspense } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/(main)/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/(main)/components/ui/form";
import { Button } from "@/app/(main)/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { Toaster } from "@/app/(main)/components/ui/toaster";
import { useToast } from "@/app/(main)/hooks/use-toast";

interface FormValues {
  genre: string;
  job: string;
  gender: string;
  theme: string;
}

const formSchema = z
  .object({
    genre: z.enum(
      [
        "한국전래동화",
        "세계전래동화",
        "판타지 동화",
        "동물 동화",
        "가족 동화",
        "직업 동화",
      ],
      { required_error: "장르를 선택해주세요." }
    ),
    job: z.string().optional(),
    gender: z.enum(["남자", "여자"], { required_error: "성별을 선택해주세요." }),
    theme: z.enum(
      [
        "우정",
        "정의",
        "마법",
        "자연",
        "사랑",
        "지혜",
        "용기",
        "극복",
        "모험",
        "탐험",
        "도덕",
      ],
      { required_error: "테마를 선택해주세요." }
    ),
  })
  .refine(
    (data) =>
      data.genre !== "직업 동화" || (data.genre === "직업 동화" && data.job),
    {
      message: "직업 동화의 경우 직업을 선택해야 합니다.",
      path: ["job"],
    }
  );

function MainTestPage() {
  const [showJobSelect, setShowJobSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const genreImages = {
    "한국전래동화": "/form/korean.png",
    "세계전래동화": "/form/world.png",
    "판타지 동화": "/form/fantasy.png",
    "동물 동화": "/form/animal.png",
    "가족 동화": "/form/family.png",
    "직업 동화": "/form/job.png",
  };

  const themeImages = {
    "우정": "/form/friend.png",
    "정의": "/form/justice.png",
    "마법": "/form/magic.png",
    "자연": "/form/nature.png",
    "사랑": "/form/love.png",
    "지혜": "/form/wisdom.png",
    "용기": "/form/courage.png",
    "극복": "/form/overcome.png",
    "모험": "/form/adventure.png",
    "탐험": "/form/explore.png",
    "도덕": "/form/moral.png",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: "",
      job: "",
      gender: "",
      theme: "",
    },
  });

  const handleGenreChange = (value: string) => {
    form.setValue("genre", value);
    setShowJobSelect(value === "직업 동화");
    if (value !== "직업 동화") {
      form.setValue("job", "");
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      console.log("동화 생성 데이터:", data);
      const combinedGenre = data.job ? `${data.job} ${data.genre}` : data.genre;
      const queryParams = new URLSearchParams({
        genre: combinedGenre,
        gender: data.gender,
        challenge: data.theme,
      });
      router.push(`/loading?${queryParams.toString()}`);
    } catch (error) {
      console.error("동화 생성 중 에러:", error);
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "동화 생성 중 문제가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    const errorMessages = Object.values(errors)
      .map((error: any) => error.message)
      .join(", ");
    toast({
      variant: "destructive",
      title: "필수 항목을 입력해주세요",
      description:  "모든 필수 항목을 선택해주세요.",
    });
  };

  return (
    <section className="p-8 relative">
      <div className="container mx-auto px-4 sm:px-8 md:px-20">
        <div className="relative p-8 rounded-lg shadow-lg">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onError)} // onError 추가
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">장르</FormLabel>
                    <FormControl>
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          {[
                            "한국전래동화",
                            "세계전래동화",
                            "판타지 동화",
                            "동물 동화",
                            "가족 동화",
                            "직업 동화",
                          ].map((genre) => {
                            const selected = field.value === genre;
                            return (
                              <div
                                key={genre}
                                onClick={() => handleGenreChange(genre)}
                                className={`
                                  cursor-pointer p-4 border rounded-lg text-lg flex flex-col items-center justify-center aspect-square
                                  ${selected ? "bg-blue-100 border-blue-500" : "border-gray-300"}
                                `}
                              >
                                <img
                                  src={genreImages[genre as keyof typeof genreImages]}
                                  alt={genre}
                                  className="w-[80%] h-[80%] mb-2"
                                />
                                <span>{genre}</span>
                              </div>
                            );
                          })}
                        </div>
                        {showJobSelect && (
                          <div className="mt-4">
                            <Select
                              onValueChange={(value) => form.setValue("job", value)}
                              value={form.watch("job")}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[200px] text-lg">
                                  <SelectValue placeholder="직업을 선택하세요" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[
                                  "소방관",
                                  "의사",
                                  "경찰관",
                                  "요리사",
                                  "선생님",
                                  "과학자",
                                  "우주인",
                                  "수의사",
                                  "운동선수",
                                  "예술가",
                                ].map((job) => (
                                  <SelectItem key={job} value={job} className="text-lg">
                                    {job}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">성별</FormLabel>
                    <FormControl>
                      <div className="flex space-x-4">
                        {["남자", "여자"].map((gender) => {
                          const selected = field.value === gender;
                          return (
                            <div
                              key={gender}
                              onClick={() => field.onChange(gender)}
                              className={`
                                cursor-pointer p-3 border rounded-lg text-lg flex flex-col items-center justify-center
                                w-32 h-32
                                ${selected ? "bg-blue-100 border-blue-500" : "border-gray-300"}
                              `}
                            >
                              <img
                                src={`/form/${gender === "남자" ? "male" : "female"}.png`}
                                alt={gender}
                                className="w-[60%] h-[60%] mb-2"
                              />
                              <span>{gender}</span>
                            </div>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">테마</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center justify-center">
                        {[
                          "우정",
                          "정의",
                          "마법",
                          "자연",
                          "사랑",
                          "지혜",
                          "용기",
                          "극복",
                          "모험",
                          "탐험",
                          "도덕",
                        ].map((theme) => {
                          const selected = field.value === theme;
                          return (
                            <div
                              key={theme}
                              onClick={() => field.onChange(theme)}
                              className={`
                                cursor-pointer p-4 border rounded-lg text-lg flex flex-col items-center justify-center aspect-square
                                ${selected ? "bg-blue-100 border-blue-500" : "border-gray-300"}
                              `}
                            >
                              <img
                                src={themeImages[theme as keyof typeof themeImages]}
                                alt={theme}
                                className="w-[80%] h-[80%] mb-2"
                              />
                              <span>{theme}</span>
                            </div>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "생성 중..." : "동화 생성하기"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Toaster />
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center py-8">로딩중...</div>}>
      <MainTestPage />
    </Suspense>
  );
}
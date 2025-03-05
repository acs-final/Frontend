"use client";

import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { ArrowBigRight, ArrowBigLeft, Play, Pause } from "lucide-react";
import { LoaderIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// 타입 정의
interface FormValues {
  genre: string;
  job: string;
  gender: string;
  theme: string;
}

interface StoryPage {
  page: string;
  text: string;
  image: string;
  audio: string;
}

interface StoryBook {
  fairytaleId: number;
  title: string;
  pages: StoryPage[];
  keywords: string[];
}

function MainTestPage() {
  // 폼 관련 상태와 API, 오디오 재생 등의 로직
  const [showJobSelect, setShowJobSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // 동화책 관련 상태는 더 이상 UI에 사용되지 않음
  const [storyBook, setStoryBook] = useState<StoryBook | null>(null);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 장르별 이미지 매핑 추가
  const genreImages = {
    "한국전래동화": "/form/korean.png",
    "세계전래동화": "/form/world.png",
    "판타지 동화": "/form/fantasy.png",
    "동물 동화": "/form/animal.png",
    "가족 동화": "/form/family.png",
    "직업 동화": "/form/job.png",
  };

  // 장르별 이미지 매핑 아래에 테마별 이미지 매핑 추가
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

  const formSchema = z.object({
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
  });

  const onSubmit = async (data: FormValues) => {
    console.log("동화 생성 데이터:", data);
    setSubmittedData(data);
    setIsLoading(true);

    try {
      // job이 있으면 job 값과 genre를 결합
      const combinedGenre = data.job ? `${data.job} ${data.genre}` : data.genre;

      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams({
        genre: combinedGenre,
        gender: data.gender,
        challenge: data.theme
        // challenge: data.theme "easy" // 기본값으로 'easy' 설정
      });

      // loading 페이지로 리다이렉트 (쿼리스트링 포함)
      router.push(`/loading?${queryParams.toString()}`);

    } catch (error) {
      console.error("동화 생성 중 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // 기본 폼 뷰 렌더링 (동화 생성 전)
  return (
    <section className="p-8 relative">
      <div className="container mx-auto px-4 sm:px-8 md:px-20">
        <div className="relative p-8 rounded-lg shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 장르 선택 */}
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      장르
                    </FormLabel>
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
                              onValueChange={(value) =>
                                form.setValue("job", value)
                              }
                              value={form.watch("job")}
                            >
                              <div>
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
                                    <SelectItem
                                      key={job}
                                      value={job}
                                      className="text-lg"
                                    >
                                      {job}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </div>
                            </Select>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.genre?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              {/* 성별 선택 */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      성별
                    </FormLabel>
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
                  </FormItem>
                )}
              />
              {/* 테마 선택 */}
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">
                      테마
                    </FormLabel>
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
                  </FormItem>
                )}
              />
              {/* 생성 버튼 */}
              <div className="flex justify-center mt-6">
                <Button type="submit">동화 생성하기</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return <MainTestPage />;
}

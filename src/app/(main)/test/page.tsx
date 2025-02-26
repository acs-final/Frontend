"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/app/(main)/components/ui/radio-group";
import { Label } from "@/app/(main)/components/ui/label";
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

// 타입 정의
interface FormValues {
  category: string;
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
  title: string;
  pages: StoryPage[];
  keywords: string[];
}

function MainTestPage() {
  // 폼 관련 상태와 API, 오디오 재생 등의 로직은 기존 코드 그대로 유지합니다.
  const [showJobSelect, setShowJobSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storyBook, setStoryBook] = useState<StoryBook | null>(null);
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [recommendedImages, setRecommendedImages] = useState<{ title: string; src: string }[]>([]);

  const form = useForm<FormValues>({
    defaultValues: {
      category: "",
      job: "",
      gender: "",
      theme: "",
    },
  });

  const handleCategoryChange = (value: string) => {
    form.setValue("category", value);
    setShowJobSelect(value === "직업 동화");
    if (value !== "직업 동화") {
      form.setValue("job", "");
    }
  };

  const formSchema = z.object({
    category: z.enum(
      [
        "한국 전래 동화",
        "세계 전래 동화",
        "판타지 동화",
        "동물 동화",
        "가족 동화",
        "직업 동화",
      ],
      { required_error: "카테고리를 선택해주세요." }
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
      // sessionStorage에서 "sub" 및 "accessToken" 값을 추출합니다.
      const memberId = sessionStorage.getItem("sub");
      const accessToken = sessionStorage.getItem("accessToken");
      console.log("page memberId:", memberId);
      console.log("page accessToken:", accessToken);

      // 카테고리가 "직업 동화"이면 선택된 직업 값을 붙여서 genre를 생성합니다.
      const genre =
        data.category === "직업 동화" && data.job
          ? `${data.job} 직업 동화`
          : data.category;

      const requestBody = {
        genre: genre,
        gender: data.gender,
        challenge: data.theme,
      };

      const response = await fetch("/api/createbookaaaaaaa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "memberId": memberId || "",
          // "accessToken": accessToken || ""
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("동화 생성 요청에 실패했습니다.");
      }

      const result = await response.json();
      console.log("동화 생성 결과:", result);

      if (result && result.isSuccess && result.result && result.result.body) {
        const storyResult = result.result;
        const sortedKeys = Object.keys(storyResult.body).sort((a, b) => {
          return (
            parseInt(a.replace("page", ""), 10) -
            parseInt(b.replace("page", ""), 10)
          );
        });
        const pages: StoryPage[] = sortedKeys.map((key, index) => ({
          page: key,
          text: storyResult.body[key],
          image: storyResult.imageUrl[index]?.imageUrl,
          audio: storyResult.mp3Url[index]?.mp3Url,
        }));
        setStoryBook({
          title: storyResult.title,
          pages,
          keywords: storyResult.keywords,
        });
        setCurrentPage(0);
      } else {
        throw new Error("유효한 동화 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("동화 생성 중 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      stopAudio();
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (storyBook && currentPage < storyBook.pages.length - 1) {
      stopAudio();
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current || !storyBook) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const audioSrc = storyBook.pages[currentPage].audio;
        if (audioSrc) {
          audioRef.current.src = audioSrc;
          audioRef.current.load();
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => console.log("오디오 재생 시작"))
              .catch((error) => {
                console.error("오디오 재생 실패:", error);
                setIsPlaying(false);
              });
          }
        } else {
          console.warn("해당 페이지에 오디오가 없습니다.");
        }
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("오디오 재생 중 에러:", error);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
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

  const generatedImages = [
    { title: "첫 번째 그림", src: "/storybook/page1.png" },
    { title: "두 번째 그림", src: "/storybook/page2.png" },
    { title: "세 번째 그림", src: "/storybook/page3.png" },
  ];

  if (isLoading && !storyBook) {
    return (
      <div className="container mx-auto px-4 sm:px-8 md:px-20 relative">
        <div className="relative p-8 rounded-lg shadow-lg">
          <div className="text-start mb-6">
            <h1 className="text-3xl font-bold">
              MOAI가 열심히 동화책을 생성하는 중이에요...
            </h1>
          </div>
          <div className="bg-gray-200 p-6 rounded-lg mb-6">
            <p className="text-lg">
              카테고리: {submittedData?.category || "N/A"}
              {submittedData?.category === "직업 동화" && submittedData?.job
                ? ` / 직업: ${submittedData.job}`
                : ""}
            </p>
            <p className="text-lg">성별: {submittedData?.gender || "N/A"}</p>
            <p className="text-lg">테마: {submittedData?.theme || "N/A"}</p>
          </div>
          <div className="flex justify-center mb-6">
            <LoaderIcon className="animate-spin text-blue-500" size={64} />
          </div>
          <div className="text-start mb-6">
            <h1 className="text-xl font-bold">미르님에게 추천하는 동화에요!</h1>
          </div>
          <div className="flex flex-col justify-center md:flex-row gap-6 items-center">
            {recommendedImages.length > 0 ? (
              recommendedImages.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Image
                    src={item.src}
                    alt={item.title}
                    width={250}
                    height={250}
                    className="rounded-lg shadow-md"
                  />
                  <h3 className="mt-2 text-xl font-medium">{item.title}</h3>
                </div>
              ))
            ) : (
              <p>추천 데이터를 불러오는 중입니다...</p>
            )}
          </div>
          <div className="flex flex-col justify-center md:flex-row gap-6 items-center mt-6">
            <iframe
              src="/trex.html"
              style={{ width: "50%", height: "43vh", border: "none", overflow: "hidden" }}
              scrolling="no"
              title="T-Rex Game"
            />
          </div>
        </div>
      </div>
    );
  }

  if (storyBook) {
    return (
      <div className="storybook mx-4 sm:mx-8 md:mx-20 min-h-[calc(100vh-200px)] flex flex-col relative">
        <button
          className="absolute left-0 top-2/3 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300 transition-colors"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
        >
          <ArrowBigLeft size={50} />
        </button>
        <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center items-center">
            <img
              src={storyBook.pages[currentPage].image || "/storybook/page5.png"}
              alt="Story illustration"
              className="w-3/4 max-w-lg rounded-lg shadow-md"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4">{storyBook.title}</h2>
            <p className="text-lg leading-relaxed mb-4">
              {storyBook.pages[currentPage].text}
            </p>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  className="audio-button flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={toggleAudio}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="flex items-center gap-2 min-w-[300px]">
                  <span className="text-sm w-12">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleTimeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm w-12">{formatTime(duration)}</span>
                </div>
              </div>
              <audio
                ref={audioRef}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onTimeUpdate={(e) =>
                  setCurrentTime(e.currentTarget.currentTime)
                }
                onEnded={() => {
                  setIsPlaying(false);
                  if (audioRef.current) audioRef.current.currentTime = 0;
                }}
                onError={(e) => {
                  console.error("오디오 로드 에러:", e);
                  setIsPlaying(false);
                }}
              />
            </div>
          </div>
        </div>
        <button
          className="absolute right-0 top-2/3 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-300 transition-colors"
          onClick={handleNextPage}
          disabled={currentPage === storyBook.pages.length - 1}
        >
          <ArrowBigRight size={50} />
        </button>
        <div className="flex justify-center gap-4 py-4 border-t border-gray-200">
          <button
            className="h-9 px-4 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center"
            onClick={() => setStoryBook(null)}
          >
            다시 만들기
          </button>
          <button
            onClick={() => (window.location.href = "/review")}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center"
          >
            평가하기
          </button>
        </div>
      </div>
    );
  }

  // 기본 폼 뷰 렌더링 (동화 생성 전)
  return (
    <section className="p-8 relative">
      <div className="container mx-auto px-4 sm:px-8 md:px-20">
        <div className="relative p-8 rounded-lg shadow-lg flex flex-col md:flex-row">
          <div className="w-full md:w-1/2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 카테고리 선택 */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        카테고리
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={handleCategoryChange}
                          defaultValue={field.value}
                          className="space-y-2"
                        >
                          {[
                            "한국 전래 동화",
                            "세계 전래 동화",
                            "판타지 동화",
                            "동물 동화",
                            "가족 동화",
                            "직업 동화",
                          ].map((category) => (
                            <div key={category} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={category}
                                id={`category-${category}`}
                                className="w-5 h-5"
                              />
                              <Label htmlFor={`category-${category}`} className="text-lg">
                                {category}
                              </Label>
                            </div>
                          ))}
                          {showJobSelect && (
                            <Select
                              onValueChange={(value) => form.setValue("job", value)}
                              defaultValue={form.getValues("job")}
                            >
                              <FormControl>
                                <SelectTrigger className="mt-2 w-[200px] text-lg">
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
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.category?.message}
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
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          {["남자", "여자"].map((gender) => (
                            <div key={gender} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={gender}
                                id={`gender-${gender}`}
                                className="w-5 h-5"
                              />
                              <Label
                                htmlFor={`gender-${gender}`}
                                className="text-lg"
                              >
                                {gender}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
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
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {[
                            ["우정", "정의", "마법", "자연", "사랑", "지혜"],
                            ["용기", "극복", "모험", "탐험", "도덕"],
                          ].map((row, i) => (
                            <div key={i} className="space-y-2">
                              {row.map((theme) => (
                                <div
                                  key={theme}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={theme}
                                    id={`theme-${theme}`}
                                    className="w-5 h-5"
                                  />
                                  <Label
                                    htmlFor={`theme-${theme}`}
                                    className="text-lg"
                                  >
                                    {theme}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* 생성 버튼 */}
                <div className="flex justify-end mt-6">
                  <Button type="submit">동화 생성하기</Button>
                </div>
              </form>
            </Form>
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center mt-8 md:mt-0">
            <Image
              src="/main_logo.png"
              alt="Logo"
              width={500}
              height={500}
              className="mb-4"
            />
            <div >
              <p className="text-xl">어서오세요</p>
              <p className="text-xl">원하시는 동화책을</p>
              <p className="text-xl">원하는대로 만들어드려요</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 레이아웃과의 중복을 피하기 위해, 여기서는 오직 본문 내용만 렌더링합니다.
export default function Page() {
  return <MainTestPage />;
}

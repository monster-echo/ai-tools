"use client";

import * as React from "react";
import Image from "next/image";
import {
  Download,
  History,
  Image as ImageIcon,
  Sparkles,
  Upload,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

import { useImageStudioStore } from "@/store/image-studio-store";
import {
  generateImageAction,
  getHistoryAction,
  generateImageVariantAction,
} from "./actions";
import { getUserCreditsAction } from "@/app/actions/user";
import { costs, get_model_cost, get_variant_cost } from "./costs";

export default function ImageStudioPage() {
  const [prompt, setPrompt] = React.useState("");
  const [ratio, setRatio] = React.useState("1:1");
  const [style, setStyle] = React.useState("illustration");
  const [model, setModel] = React.useState("flux1");
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Image to Image state
  const [i2iPrompt, setI2iPrompt] = React.useState("");
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [strength, setStrength] = React.useState([50]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { generations, addGeneration, setGenerations, credits, setCredits } =
    useImageStudioStore();

  React.useEffect(() => {
    const loadData = async () => {
      const [historyResult, creditsResult] = await Promise.all([
        getHistoryAction(),
        getUserCreditsAction(),
      ]);

      if (historyResult.success && historyResult.data) {
        // Map string dates back to Date objects if necessary, or ensure types match
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedGenerations = historyResult.data.map((gen: any) => ({
          id: gen.id,
          imageUrl: gen.imageUrl || undefined,
          status: gen.status as "PENDING" | "COMPLETED" | "FAILED",
          prompt: gen.prompt,
          ratio: gen.ratio,
          createdAt: new Date(gen.createdAt),
        }));
        setGenerations(mappedGenerations);
      }

      if (creditsResult.success) {
        setCredits(creditsResult.credits || 0);
      }
    };
    loadData();
  }, [setGenerations, setCredits]);

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const result = await generateImageAction({
        prompt,
        ratio,
        style,
        model,
      });

      if (result.success && result.data) {
        addGeneration({
          id: result.data.id,
          imageUrl: result.data.imageUrl,
          status: result.data.status,
          prompt: result.data.prompt,
          ratio: result.data.ratio,
          createdAt: result.data.createdAt,
        });
        // Refresh credits
        const creditsResult = await getUserCreditsAction();
        if (creditsResult.success) {
          setCredits(creditsResult.credits || 0);
        }
      } else {
        console.error(result.error);
        if (result.error === "Insufficient credits") {
          alert("余额不足，请充值");
        }
      }
    } catch (error) {
      console.error("Failed to generate:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVariant = async () => {
    if (!selectedImage || !i2iPrompt) return;

    setIsGenerating(true);
    try {
      const result = await generateImageVariantAction({
        prompt: i2iPrompt,
        image: selectedImage,
        strength: strength[0] / 100, // Convert 0-100 to 0-1
        model,
      });

      if (result.success && result.data) {
        addGeneration({
          id: result.data.id,
          imageUrl: result.data.imageUrl,
          status: result.data.status,
          prompt: result.data.prompt,
          ratio: result.data.ratio,
          createdAt: result.data.createdAt,
        });
        // Refresh credits
        const creditsResult = await getUserCreditsAction();
        if (creditsResult.success) {
          setCredits(creditsResult.credits || 0);
        }
      } else {
        console.error(result.error);
        if (result.error === "Insufficient credits") {
          alert("余额不足，请充值");
        } else {
          alert(result.error || "生成失败");
        }
      }
    } catch (error) {
      console.error("Failed to generate variant:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            AI Image Studio
          </h1>
          <p className="text-xs text-muted-foreground">
            文生图 · 图生图 · 多模型试验场
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-normal">
            余额：{credits} pts
          </Badge>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">登录</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      <main className="grid h-[calc(100vh-73px)] grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* Left Panel: Controls */}
        <div className="border-r bg-card p-6 overflow-y-auto">
          <Tabs defaultValue="text-to-image" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text-to-image">文生图</TabsTrigger>
              <TabsTrigger value="image-to-image">图生图</TabsTrigger>
            </TabsList>

            <TabsContent value="text-to-image" className="space-y-6 mt-0">
              {/* Model Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  模型
                </Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flux1">Flux 1.0</SelectItem>
                    <SelectItem value="flux2">Flux 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt Input */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Prompt
                </Label>
                <Textarea
                  placeholder="例如：黄昏的城市屋顶，柔和的霓虹灯，赛博朋克插画风格..."
                  className="min-h-[120px] resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  比例
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {["1:1", "3:4", "16:9"].map((r) => (
                    <Button
                      key={r}
                      variant={ratio === r ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRatio(r)}
                      className="w-full"
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  风格
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {["插画", "写实", "赛博"].map((s) => (
                    <Button
                      key={s}
                      variant={style === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStyle(s)}
                      className="w-full"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    细节强度
                  </Label>
                  <span className="text-xs text-muted-foreground">70%</span>
                </div>
                <Slider defaultValue={[70]} max={100} step={1} />
              </div>

              {/* Generate Button */}
              <Button
                className="w-full py-6 text-base"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "生成中..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成图片 ({get_model_cost(model as keyof typeof costs)} pts)
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="image-to-image" className="space-y-6 mt-0">
              {/* Model Selection (I2I) */}
              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  模型
                </Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flux1">Flux 1.0</SelectItem>
                    <SelectItem value="flux2">Flux 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              <Card
                className="border-dashed cursor-pointer hover:bg-accent/50 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground p-0 min-h-40">
                  {selectedImage ? (
                    <div className="relative w-full h-full min-h-40">
                      <Image
                        src={selectedImage}
                        alt="Reference"
                        fill
                        className="object-contain max-h-[300px]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity z-10">
                        <span className="text-white text-sm">点击更换图片</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Upload className="h-8 w-8 mb-3 opacity-50" />
                      <span className="text-xs">点击或拖拽上传参考图</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  修改描述
                </Label>
                <Textarea
                  placeholder="想怎么改？例如：把背景换成雪山..."
                  className="min-h-[100px] resize-none"
                  value={i2iPrompt}
                  onChange={(e) => setI2iPrompt(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    重绘强度
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {strength[0]}%
                  </span>
                </div>
                <Slider
                  value={strength}
                  onValueChange={setStrength}
                  max={100}
                  step={1}
                />
              </div>

              <Button
                className="w-full py-6 text-base"
                onClick={handleGenerateVariant}
                disabled={isGenerating || !selectedImage || !i2iPrompt}
              >
                {isGenerating ? (
                  "生成中..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成变体 ({get_variant_cost(model)} pts)
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Results */}
        <div className="bg-muted/30 p-6 lg:p-8 overflow-y-auto relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-medium">生成结果</h2>
            <Badge variant="secondary" className="gap-1">
              <History className="h-3 w-3" />
              历史记录 · {generations.length} 组
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {generations.map((gen) => (
              <Card
                key={gen.id}
                className="group relative aspect-square overflow-hidden border-0 bg-muted/50"
              >
                {gen.imageUrl ? (
                  <Image
                    src={gen.imageUrl}
                    alt={gen.prompt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized // Since we might be loading from external URLs that are not configured in next.config.js yet
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-t from-black/60 to-transparent">
                  <span className="text-[10px] font-medium text-white px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm truncate max-w-[120px]">
                    {gen.ratio} · {gen.prompt}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-full text-white hover:bg-white/20 hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}

            {generations.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-xs text-muted-foreground">
                  暂无生成记录，快去左侧试试吧
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface FortuneItem {
  rank: number;
  animal: string;
  animalJapanese: string;
  luckyKeyword: string;
  description: string;
}

export const getDailyFortune = async (date: string): Promise<FortuneItem[]> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const prompt = `
[운세 아카이빙 요청]
1. 대상 날짜: ${date}
2. 요청 포맷: 십이간지 전체 랭킹 표
3. 표기 규칙:
- 동물 이름: 한글(말띠, 호랑이띠 등)로 표기
- 동물 이름 일본어: 히라가나로 표기 (예: うし, とら 등)
- 행운 키워드: 일본어 한자 위에 일본어 요미가나(LaTeX $\\overset{\\text{요미가나}}{\\text{한자}}$ 형태), 옆에 한글 뜻 병기. **주의: LaTeX 코드 안에 'ext' 같은 불필요한 문자나 태그를 절대 포함하지 마세요.**
- 운세 풀이: 한국어로 서술 (비즈니스 상황, 일상생활, 연애운 전부 OK. 오늘의 핵심 포인트가 되는 풀이만 서술)
- 정렬: 행운 순위가 높은 순서대로 리스트업
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "당신은 전문적인 동양 철학가이자 운세 전문가입니다. 사용자의 질문에 대해 최신 정보와 전통적인 운세 해석을 결합하여 답변하세요. 응답은 반드시 지정된 JSON 형식을 따라야 합니다.",
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rank: { type: Type.INTEGER, description: "1부터 12까지의 순위" },
            animal: { type: Type.STRING, description: "동물 이름 (예: 말띠)" },
            animalJapanese: { type: Type.STRING, description: "동물 이름 일본어 히라가나" },
            luckyKeyword: { type: Type.STRING, description: "LaTeX 형식의 일본어 키워드와 한글 뜻" },
            description: { type: Type.STRING, description: "상세 운세 풀이" }
          },
          required: ["rank", "animal", "animalJapanese", "luckyKeyword", "description"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};

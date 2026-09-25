import { useLanguage } from '@/src/hooks/useLanguage'
import { useQuery } from '@tanstack/react-query'

// Importando os versículos mockados
import versiculosPT from '@/src/i18n/versiculos-pt.json'
import versiculosEN from '@/src/i18n/versiculos.json'

export type VerseOfTheDay = string[]

// Definindo interfaces para nossos versículos
interface VersiculoMock {
  verse: string
  reference: string
  id: string
}

// Interface para versículo traduzido, adaptada do projeto
export interface TranslatedVerse {
  text: string
  reference: string
  translation: string
}

/**
 * Hook para obter a data atual no formato YYYY-MM-DD
 * @returns A data atual formatada
 */
export const useCurrentDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Função para obter um versículo aleatório
 * @returns Um índice aleatório entre 0 e o número total de versículos menos 1
 */
const getRandomVerseIndex = (): number => {
  // Usamos a data atual como seed para o número aleatório
  // para garantir que o mesmo versículo seja exibido durante todo o dia
  const date = new Date()
  const seed = date.getDate() + (date.getMonth() + 1) * 31

  // Usamos a data como seed para obter o mesmo versículo durante o dia inteiro
  return seed % versiculosEN.length
}

/**
 * Adaptando o versículo para o formato esperado pela aplicação
 */
const adaptVerse = (verse: VersiculoMock): VerseOfTheDay => {
  // Convertendo para o formato de array que a aplicação espera
  return [verse.verse, verse.reference, verse.id]
}

/**
 * Hook para obter um versículo do dia usando o idioma atual do app
 * @returns O versículo do dia no idioma atual do app
 */
export const useVerseOfTheDay = () => {
  const currentDate = useCurrentDate()
  const { isEnglish } = useLanguage()

  return useQuery<VerseOfTheDay>({
    queryKey: ['verseOfTheDay', currentDate, isEnglish],
    queryFn: () => {
      // Obter o índice do versículo baseado na data atual
      const verseIndex = getRandomVerseIndex()

      // Selecionar o versículo baseado no idioma atual
      const verseData = isEnglish
        ? versiculosEN[verseIndex]
        : versiculosPT[verseIndex]

      // Retornar no formato esperado pelo app
      return adaptVerse(verseData)
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    retry: 1,
  })
}

/**
 * Hook personalizado para manter compatibilidade com outras partes do app
 * que possam estar usando este hook, agora é apenas um wrapper do useVerseOfTheDay
 * que sempre retorna um versículo no idioma atual do app
 *
 * @returns O resultado da query com o versículo no idioma atual
 */
export const useTranslatedVerseOfTheDay = () => {
  const currentDate = useCurrentDate()
  const verseQuery = useVerseOfTheDay()
  const { isEnglish } = useLanguage()

  return useQuery<TranslatedVerse>({
    queryKey: ['translatedVerseOfTheDay', currentDate, isEnglish],
    queryFn: () => {
      if (!verseQuery.data || verseQuery.data.length < 3) {
        throw new Error('Versículo não disponível')
      }

      // Retornar o versículo no formato esperado
      return {
        text: verseQuery.data[0],
        reference: verseQuery.data[1],
        translation: isEnglish ? 'NIV' : 'NAA', // Tradução apropriada conforme o idioma
      }
    },
    enabled: !!verseQuery.data, // Só executa quando o versículo estiver disponível
    staleTime: 24 * 60 * 60 * 1000, // 24 horas
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    retry: 1,
  })
}

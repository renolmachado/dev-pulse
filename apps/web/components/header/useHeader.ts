import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types/article';

export const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: Category.LIFESTYLE_WELLNESS, label: 'Lifestyle & Wellness' },
  { value: Category.TECHNOLOGY_INNOVATION, label: 'Technology & Innovation' },
  { value: Category.SOFTWARE_ENGINEERING_DEVELOPMENT, label: 'Software Engineering' },
  { value: Category.BUSINESS_FINANCE, label: 'Business & Finance' },
  { value: Category.ARTS_ENTERTAINMENT, label: 'Arts & Entertainment' },
  { value: Category.NEWS_SOCIETY, label: 'News & Society' },
  { value: Category.SCIENCE_NATURE, label: 'Science & Nature' },
  { value: Category.POLITICS_GOVERNMENT, label: 'Politics & Government' },
  { value: Category.SPORTS_RECREATION, label: 'Sports & Recreation' },
  { value: Category.EDUCATION_CAREER, label: 'Education & Career' },
  { value: Category.HEALTH_MEDICINE, label: 'Health & Medicine' },
];

export const useHeader = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const category = event.target.value;
    if (category) {
      router.push(`/?category=${category}`);
    } else {
      router.push('/');
    }
  };

  return {
    currentCategory,
    handleCategoryChange,
    categoryOptions,
  };
};

import { useNavigate, useParams } from 'react-router-dom';
import { disasterNews } from '@/data/mockData';
import { ArrowLeft, ExternalLink, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const newsImages: Record<string, string> = {
  flood: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&h=400&fit=crop',
  landslide: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
  typhoon: 'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=600&h=400&fit=crop',
  earthquake: 'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=600&h=400&fit=crop',
  global: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
};

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const news = disasterNews.find(n => n.id === id);

  if (!news) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background p-4">
        <p className="text-muted-foreground">Article not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const image = news.imageUrl !== '/placeholder.svg' ? news.imageUrl : (newsImages[news.disasterType] || newsImages.global);

  return (
    <div className="h-full overflow-y-auto bg-background pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 bg-card border-b border-border sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-accent">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1 truncate">{news.source}</h1>
      </div>

      {/* Hero Image */}
      <img src={image} alt={news.title} className="w-full h-52 object-cover" />

      {/* Content */}
      <div className="px-4 pt-4 space-y-4">
        <h2 className="text-xl font-bold text-foreground leading-tight">{news.title}</h2>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {news.date}</span>
          {news.country && (
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {news.country}</span>
          )}
        </div>

        <p className="text-sm text-foreground leading-relaxed">{news.summary}</p>

        {news.sourceUrl && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => window.open(news.sourceUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Read Full Article
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPage;

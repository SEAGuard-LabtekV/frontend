import { useNavigate, useParams } from 'react-router-dom';
import { survivalTips } from '@/data/mockData';
import { ArrowLeft, BookOpenText, Lightbulb, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useTranslation } from '@/contexts/TranslationContext';

const stepImages: Record<string, string[]> = {
  's1': [
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1559060017-445fb9722f2a?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=500&h=280&fit=crop',
  ],
  's2': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1559060017-445fb9722f2a?w=500&h=280&fit=crop',
  ],
  's3': [
    'https://images.unsplash.com/photo-1509803874385-db7c23652552?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1559060017-445fb9722f2a?w=500&h=280&fit=crop',
  ],
  's4': [
    'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1573152143286-0c422b4d2175?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1559060017-445fb9722f2a?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=500&h=280&fit=crop',
  ],
};

const GuideDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const guide = survivalTips.find(t => t.id === id);

  const formatDisasterType = (value: string) => {
    if (value === 'general') return 'General Safety';
    return value
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  if (!guide) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-4xl items-center px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-10 lg:pb-10">
          <div className="clay-lg w-full overflow-hidden">
            <div className="relative p-6 text-center sm:p-8">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/10 to-transparent" />
              <div className="relative mx-auto flex max-w-md flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-clay-sm">
                  <BookOpenText className="h-8 w-8" />
                </div>
                <h1 className="mt-5 text-2xl font-black tracking-tight text-foreground">
                  {t('guide_not_found')}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t('survival_guide')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t('go_back')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images = stepImages[guide.id] || [];
  const heroImage = images[0] || null;
  const disasterLabel = formatDisasterType(guide.disasterType);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 md:pb-32 lg:px-8 lg:pb-10">
        <div className="clay-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
          <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-stretch">
            <div className="space-y-5">
              <Button
                variant="outline"
                size="sm"
                className="w-fit bg-card/80 backdrop-blur-sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                {t('go_back')}
              </Button>

              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.75rem] bg-primary/10 text-4xl shadow-clay-sm">
                  {guide.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/80">
                    {t('survival_guide')}
                  </p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                    {guide.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {guide.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5 bg-primary/10 px-3 py-1 text-primary">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {disasterLabel}
                </Badge>
                <Badge variant="outline" className="gap-1.5 border-border/70 bg-card/70 px-3 py-1">
                  <BookOpenText className="h-3.5 w-3.5 text-primary" />
                  {guide.steps.length} {t('guide_steps')}
                </Badge>
              </div>
            </div>

            <div className="lg:self-stretch">
              {heroImage ? (
                <div className="clay-sm overflow-hidden border border-border/60 bg-card/85 backdrop-blur-sm">
                  <AspectRatio ratio={16 / 11}>
                    <img
                      src={heroImage}
                      alt={guide.title}
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                </div>
              ) : (
                <div className="clay-sm flex h-full min-h-64 items-center justify-center border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-6xl shadow-clay-sm">
                    {guide.icon}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/80">
                {t('details')}
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                {guide.steps.length} {t('guide_steps')}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {guide.description}
            </p>
          </div>

          <div className="mt-4 grid auto-rows-fr grid-cols-1 gap-4 xl:grid-cols-2">
            {guide.steps.map((step, i) => {
              const image = images[i];
              const stepLabel = `${t('guide_step')} ${i + 1}`;

              return (
                <article
                  key={i}
                  className="clay-sm h-full overflow-hidden border border-border/60 bg-card/95"
                >
                  {image && (
                    <AspectRatio ratio={16 / 10}>
                      <img
                        src={image}
                        alt={stepLabel}
                        className="h-full w-full object-cover"
                      />
                    </AspectRatio>
                  )}
                  <div className="flex h-full flex-col p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-base font-black text-primary-foreground shadow-clay-sm">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary/80">
                          {stepLabel}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground sm:text-base">
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="clay-lg relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-l from-primary/10 to-transparent md:block" />
            <div className="relative grid gap-4 p-5 sm:p-6 md:grid-cols-[auto,1fr] md:items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary shadow-clay-sm">
                <Lightbulb className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/80">
                  {t('guide_remember')}
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground sm:text-base">
                  {t('guide_share_note')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GuideDetailPage;

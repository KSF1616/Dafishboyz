import React, { useState, useEffect } from 'react';
import { useLogo, DEFAULT_LOGO } from '@/contexts/LogoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, RotateCcw, Eye, Copy, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminLogoSettings() {
  const { logoUrl, setLogoUrl, resetToDefault } = useLogo();
  const [inputUrl, setInputUrl] = useState(logoUrl);
  const [previewUrl, setPreviewUrl] = useState(logoUrl);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setInputUrl(logoUrl);
    setPreviewUrl(logoUrl);
  }, [logoUrl]);

  const handlePreview = () => {
    setPreviewUrl(inputUrl);
    setImageError(false);
  };

  const handleSave = () => {
    if (!inputUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    setLogoUrl(inputUrl);
    toast({
      title: "Logo Updated!",
      description: "Your logo has been updated everywhere on the site.",
    });
  };

  const handleReset = () => {
    resetToDefault();
    setInputUrl(DEFAULT_LOGO);
    setPreviewUrl(DEFAULT_LOGO);
    setImageError(false);
    toast({
      title: "Logo Reset",
      description: "Logo has been reset to the default.",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  // Common Supabase bucket URLs to try
  const suggestedUrls = [
    {
      label: "Logo Bucket (CORRECT - dafishboyz-logo.png)",
      url: "https://yrfjejengmkqpjbluexn.supabase.co/storage/v1/object/public/Logo/dafishboyz-logo.png"
    },
    {
      label: "Marketing Bucket (dafishboyz-logo.png)",
      url: "https://ztfxcppczviwjuekijzc.supabase.co/storage/v1/object/public/marketing/dafishboyz-logo.png"
    },
    {
      label: "Marketing Bucket (DAFISH-BOYZ-LOGO.png)",
      url: "https://ztfxcppczviwjuekijzc.supabase.co/storage/v1/object/public/marketing/DAFISH-BOYZ-LOGO.png"
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-amber-900 mb-8">Logo Settings</h1>
        
        {/* Current Logo Display */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Logo</CardTitle>
            <CardDescription>This is the logo currently displayed across the entire site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="bg-amber-900 p-8 rounded-lg">
                <img 
                  src={logoUrl} 
                  alt="Current Logo" 
                  className="h-24 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="flex items-center gap-2 w-full max-w-2xl">
                <Input value={logoUrl} readOnly className="text-xs" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(logoUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.open(logoUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Logo Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Update Logo</CardTitle>
            <CardDescription>
              Paste any image URL below. The logo will update everywhere on the site instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL</label>
              <div className="flex gap-2">
                <Input 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://your-image-url.com/logo.png"
                  className="flex-1"
                />
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="bg-amber-900 p-8 rounded-lg flex items-center justify-center min-h-[150px]">
                {imageError ? (
                  <div className="text-white text-center">
                    <p className="text-red-400 font-medium">Image failed to load</p>
                    <p className="text-sm text-amber-200 mt-1">Check the URL and try again</p>
                  </div>
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Logo Preview" 
                    className="h-24 w-auto object-contain"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700"
                disabled={imageError}
              >
                <Check className="h-4 w-4 mr-2" />
                Save Logo
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick URL Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick URL Options</CardTitle>
            <CardDescription>
              Click any of these to try different URL formats for your logo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestedUrls.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500 truncate">{item.url}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setInputUrl(item.url);
                        setPreviewUrl(item.url);
                        setImageError(false);
                      }}
                    >
                      Try This
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Manual Instructions */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">How to find your logo URL:</h4>
              <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to Storage → marketing bucket</li>
                <li>Find your logo file</li>
                <li>Click on it and copy the public URL</li>
                <li>Paste it in the URL field above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

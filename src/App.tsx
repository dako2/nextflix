import { useState } from 'react'
import './App.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Film, Image as ImageIcon } from 'lucide-react'

const API_BASE_URL = 'https://app-iiwkaqrb.fly.dev'

interface Scene {
  scene_number: string
  description: string
  image_url: string
  status: string
}

interface Movie {
  movie_id: string
  plot: string
  scenes: Scene[]
  status: string
}

function App() {
  const [plot, setPlot] = useState('')
  const [numScenes, setNumScenes] = useState(4)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMovie, setGeneratedMovie] = useState<Movie | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateMovie = async () => {
    if (!plot.trim()) {
      setError('Please enter a movie plot')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedMovie(null)

    try {
      const response = await fetch(`${API_BASE_URL}/generate-movie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plot: plot.trim(),
          num_scenes: numScenes
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const movie: Movie = await response.json()
      setGeneratedMovie(movie)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate movie')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Film className="h-8 w-8 text-red-600" />
            AI Movie Generator
          </h1>
          <p className="text-gray-300">Transform your story ideas into visual movie scenes</p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create Your Movie</CardTitle>
            <CardDescription className="text-gray-300">
              Enter a movie plot and we'll generate a series of scene images for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plot" className="text-white">Movie Plot</Label>
              <Textarea
                id="plot"
                placeholder="Enter your movie plot here... (e.g., A young wizard discovers he has magical powers and must attend a school for wizards...)"
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
                className="min-h-[120px] bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scenes" className="text-white">Number of Scenes</Label>
              <Input
                id="scenes"
                type="number"
                min="1"
                max="10"
                value={numScenes}
                onChange={(e) => setNumScenes(parseInt(e.target.value) || 4)}
                className="w-32 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <Button 
              onClick={generateMovie} 
              disabled={isGenerating || !plot.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Movie...
                </>
              ) : (
                <>
                  <Film className="mr-2 h-4 w-4" />
                  Generate Movie
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-600 bg-red-900/20">
            <CardContent className="pt-6">
              <p className="text-red-400">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {generatedMovie && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Film className="h-5 w-5 text-red-600" />
                Generated Movie
              </CardTitle>
              <CardDescription className="text-gray-300">
                Movie ID: {generatedMovie.movie_id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-white">Plot Summary</h3>
                <p className="text-gray-300 bg-gray-800 p-3 rounded-lg">{generatedMovie.plot}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 text-white">Generated Scenes</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {generatedMovie.scenes.map((scene) => (
                    <Card key={scene.scene_number} className="overflow-hidden bg-gray-800 border-gray-600">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-white">Scene {scene.scene_number}</CardTitle>
                          <Badge variant={scene.status === 'completed' ? 'default' : 'destructive'} className={scene.status === 'completed' ? 'bg-red-600 text-white' : ''}>
                            {scene.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-300">{scene.description}</p>
                        {scene.image_url && scene.status === 'completed' ? (
                          <div className="relative">
                            <img
                              src={scene.image_url}
                              alt={`Scene ${scene.scene_number}: ${scene.description}`}
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Available'
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-red-600/80 text-white">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Scene Image
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">Image generation failed</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App

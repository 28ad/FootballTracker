import NewsAPI from 'newsapi';

// Create an instance of NewsAPI with your API key
const newsapi = new NewsAPI('eb1c2e4fbbd44c9e8e6689fd944b25a3');

// Define structure of article returned from NewsAPI
interface Article {
    title: string;
    publishedAt: string;
}

// Define structure of data returned from NewsAPI
export interface NewsAPIResult {
    articles: Array<Article>;
}

// Function to download data from API
export async function downloadNewsData(): Promise<NewsAPIResult> {
    // Define an array of teams to track
    const teamsToTrack: string[] = ["Crystal Palace", "Palace", "Arsenal", "Tottenham", "Spurs", "Chelsea", "West Ham", "Irons",  "Premier League", "Football"];

    // Loop through each team to search for news
    for (const team of teamsToTrack) {
        // Search API with the specified query parameters
        const result: NewsAPIResult = await newsapi.v2.everything({
            q: team,
            pageSize: 100,
            language: 'en'
        });

        return result;

        // Output results
        console.log(`Number of articles for ${team}: ${result.articles.length}`);
        for (const article of result.articles) {
            const date = new Date(article.publishedAt);
            console.log(`Unix Time: ${date.getTime()} - Title: ${article.title}`);
        }
    }
}

// Run the function to download news data
downloadNewsData();

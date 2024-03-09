// DataHandler.js

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const formatData = (inputData, movieLink) => {
    const {
        Title,
        Year,
        Rated,
        Released,
        Runtime,
        Genre,
        Director,
        Actors,
        Plot,
        Awards,
        Poster,
        Ratings,
        imdbRating
    } = inputData;

    const rottenTomatoesRating = Ratings.find(rating => rating.Source === "Rotten Tomatoes")?.Value || "";

    return {
        Title,
        Year,
        Rated,
        Released,
        Runtime,
        Genre,
        Director,
        Actors,
        Plot,
        Awards,
        Poster,
        "Rotten Tomatoes": rottenTomatoesRating,
        imdbRating,
        movieLink
    };
};

const assignId = (dbJson) => {
    // Get the last movie object from the 'movies' array
    const lastMovie = dbJson.movies[dbJson.movies.length - 1];
    // Extract the last ID and increment it by 1
    const lastId = lastMovie ? lastMovie.id : 0;
    return lastId + 1;
};

const promptForData = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let originalFormattedData;


    rl.question('Paste the original formatted data: ', (input) => {
        try {
            originalFormattedData = JSON.parse(input);
            rl.question('Enter the JustWatch Movies URL: ', (movieLink) => {
                const dbFilePath = path.join(__dirname, '../../db.json');

                // Read the existing data from db.json
                fs.readFile(dbFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading db.json:', err);
                        rl.close();
                        return;
                    }

                    let dbJson;
                    try {
                        dbJson = JSON.parse(data);
                    } catch (error) {
                        console.error('Invalid JSON format in db.json:', error);
                        rl.close();
                        return;
                    }

                    // Assign an ID to the newly formatted data
                    const formattedData = formatData(originalFormattedData, movieLink);
                    formattedData.id = assignId(dbJson);

                    // Append the formatted data to the existing 'movies' array
                    if (!dbJson.movies) {
                        dbJson.movies = [];
                    }
                    dbJson.movies.push(formattedData);

                    // Write the updated data back to db.json
                    fs.writeFile(dbFilePath, JSON.stringify(dbJson, null, 2), 'utf8', (err) => {
                        if (err) {
                            console.error('Error writing to db.json:', err);
                        } else {
                            console.log('Data has been appended to db.json');
                        }
                        rl.close();
                    });
                });
            });
        } catch (error) {
            console.error('Invalid input. Please paste valid JSON data.');
            rl.close();
        }
    });
};


if (require.main === module) {
    promptForData();
}

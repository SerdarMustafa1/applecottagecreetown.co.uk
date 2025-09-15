✅ COMPLETED TASKS:

✅ Reviewed legacy site and reinstated missing content:
   - Added planning permission details to property details and highlights
   - Added key metrics: 0.13 acres (≈ 532 m²), ~122 m² main house + ~25 m² annex
   - Added location info: A75 (2 min), Kirroughtree (5 min), Newton Stewart (10 min), Mossyard (15 min)
   - Added what3words: ///silk.dynamics.quitter
   - Added energy efficiency details (Vaillant aroSTOR, infrared heating, Ohme EV charger, Octopus Energy)

✅ Fixed CORS issues for 360° panoramas:
   - Applied CloudFront Response Headers Policy with proper CORS headers
   - Added Access-Control-Allow-Origin: *
   - Added Access-Control-Allow-Methods: GET, HEAD
   - Added Access-Control-Expose-Headers: Content-Length, Content-Range
   - Invalidated CloudFront cache (ID: IC84GKJ8OX972OD8IGT5SK2QFY)

✅ Fixed JavaScript errors:
   - Added analyticsId to site configuration to resolve gaId undefined error
   - Cookie banner files are properly in place at /cookie-banner/

✅ Replaced contact form with TidyCal booking:
   - Both "Book a Viewing" buttons now link to https://tidycal.com/sidmustafa/apple-cottage-viewing
   - Updated navigation from "Contact" to "Book Viewing"

⚠️ Optional: Set up Google Analytics
   - Add Google Analytics ID (G-LHB9R5TLL1) to site.config.ts analyticsId field if tracking is desired
   - Currently disabled (analyticsId: undefined)

📝 All major tasks completed! The website now includes:
   - All missing content from legacy site
   - Working 360° panoramas (CORS fixed)
   - TidyCal booking integration
   - Energy efficiency details
   - Proper error handling
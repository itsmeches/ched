<?php

namespace App\Http\Controllers;

use App\Models\ResearchProposal;
use Symfony\Component\HttpFoundation\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $xml = new \XMLWriter();
        $xml->openMemory();
        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('urlset');
        $xml->writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

        $this->writeUrl($xml, route('research.public.index'), now()->toAtomString(), 'daily', '1.0');

        ResearchProposal::query()
            ->where('status', ResearchProposal::STATUS_APPROVED)
            ->orderByDesc('updated_at')
            ->chunkById(500, function ($proposals) use ($xml) {
                foreach ($proposals as $p) {
                    $this->writeUrl(
                        $xml,
                        route('research.public.show', $p->id),
                        ($p->updated_at ?? $p->approved_at ?? $p->created_at)?->toAtomString(),
                        'monthly',
                        '0.7',
                    );
                }
            });

        $xml->endElement();
        $xml->endDocument();

        return new Response($xml->outputMemory(), 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    private function writeUrl(\XMLWriter $xml, string $loc, ?string $lastmod, string $changefreq, string $priority): void
    {
        $xml->startElement('url');
        $xml->writeElement('loc', $loc);
        if ($lastmod) {
            $xml->writeElement('lastmod', $lastmod);
        }
        $xml->writeElement('changefreq', $changefreq);
        $xml->writeElement('priority', $priority);
        $xml->endElement();
    }
}

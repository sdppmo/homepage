/**
 * Page Usage Logger
 * Logs page access to Supabase for analytics
 */
(function() {
    'use strict';

    // Get current page path
    function getPagePath() {
        var path = window.location.pathname;
        // Remove leading slash and normalize
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        // If empty or just index, use 'index.html'
        if (!path || path === '' || path.endsWith('/')) {
            path = 'index.html';
        }
        return path;
    }

    // Log page usage
    function logPageUsage() {
        // Check if user is logged in
        if (!window.SDP || !window.SDP.auth) {
            return;
        }

        window.SDP.auth.getSession().then(function(session) {
            if (!session || !session.access_token) {
                return; // Not logged in, skip logging
            }

            var pagePath = getPagePath();
            var supabaseUrl = window.SDP_AUTH_CONFIG ? window.SDP_AUTH_CONFIG.url : '';
            
            if (!supabaseUrl) {
                console.warn('Supabase URL not configured');
                return;
            }

            // Call log-usage Edge Function
            fetch(supabaseUrl + '/functions/v1/log-usage', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + session.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feature_name: pagePath,
                    metadata: {
                        page_title: document.title,
                        referrer: document.referrer || '',
                        timestamp: new Date().toISOString()
                    }
                })
            }).catch(function(err) {
                // Silently fail - don't interrupt user experience
                console.debug('Failed to log page usage:', err);
            });
        }).catch(function(err) {
            // Silently fail
            console.debug('Failed to get session for page usage logging:', err);
        });
    }

    // Log when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', logPageUsage);
    } else {
        // DOM already loaded
        logPageUsage();
    }
})();

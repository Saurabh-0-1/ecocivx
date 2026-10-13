/**
 * EcoCivX - Environmental Monitoring & Civic Issue Reporting Platform
 * Frontend Vanilla JavaScript Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    issues: [],
    environmentalOverview: null,
    airQuality: null,
    activeFilterCategory: '',
    activeFilterStatus: '',
    searchQuery: '',
    selectedMapIssueId: null,
  };

  // DOM Elements - Navigation & System
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const footerApiStatus = document.getElementById('footerApiStatus');

  // DOM Elements - Metrics & Environmental
  const heroAqiVal = document.getElementById('heroAqiVal');
  const heroAqiStatus = document.getElementById('heroAqiStatus');
  const heroAqiPrimary = document.getElementById('heroAqiPrimary');
  const heroCanopy = document.getElementById('heroCanopy');
  const heroWaste = document.getElementById('heroWaste');
  const heroWater = document.getElementById('heroWater');
  const proofActiveCount = document.getElementById('proofActiveCount');

  const overviewCanopy = document.getElementById('overviewCanopy');
  const overviewWaste = document.getElementById('overviewWaste');
  const overviewWater = document.getElementById('overviewWater');
  const overviewReports = document.getElementById('overviewReports');

  const aqiMeterVal = document.getElementById('aqiMeterVal');
  const aqiMeterStatus = document.getElementById('aqiMeterStatus');
  const aqiPrimaryPollutant = document.getElementById('aqiPrimaryPollutant');
  const aqiStationName = document.getElementById('aqiStationName');
  const aqiUpdatedTime = document.getElementById('aqiUpdatedTime');
  const pollutantsList = document.getElementById('pollutantsList');

  // DOM Elements - Map
  const mapPinsContainer = document.getElementById('mapPinsContainer');
  const mapPinCard = document.getElementById('mapPinCard');
  const pinCardContent = document.getElementById('pinCardContent');
  const pinCardClose = document.getElementById('pinCardClose');
  const btnRecenterMap = document.getElementById('btnRecenterMap');

  // DOM Elements - Feed & Filter
  const issuesGrid = document.getElementById('issuesGrid');
  const categoryFilter = document.getElementById('categoryFilter');
  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchInput');
  const btnRefreshFeed = document.getElementById('btnRefreshFeed');

  // DOM Elements - Form
  const civicReportForm = document.getElementById('civicReportForm');
  const issueDescription = document.getElementById('issueDescription');
  const descCharCount = document.getElementById('descCharCount');
  const btnPrefillLocation = document.getElementById('btnPrefillLocation');
  const btnSubmitReport = document.getElementById('btnSubmitReport');
  const submitSpinner = document.getElementById('submitSpinner');
  const submitBtnText = document.getElementById('submitBtnText');
  const reportSuccessBanner = document.getElementById('reportSuccessBanner');
  const reportErrorBanner = document.getElementById('reportErrorBanner');
  const createdReportId = document.getElementById('createdReportId');
  const errorList = document.getElementById('errorList');
  const dismissSuccessBanner = document.getElementById('dismissSuccessBanner');
  const dismissErrorBanner = document.getElementById('dismissErrorBanner');

  // ---------------------------------------------------------------------------
  // API Fetch Utilities
  // ---------------------------------------------------------------------------

  async function checkSystemHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        footerApiStatus.textContent = `FastAPI Online (${data.app} ${data.version})`;
      } else {
        footerApiStatus.textContent = 'API Degraded';
      }
    } catch {
      footerApiStatus.textContent = 'Backend Offline';
    }
  }

  async function fetchEnvironmentalOverview() {
    try {
      const res = await fetch('/api/environmental/overview');
      if (res.ok) {
        state.environmentalOverview = await res.json();
        renderEnvironmentalOverview(state.environmentalOverview);
      }
    } catch (err) {
      console.warn('Could not load environmental overview:', err);
    }
  }

  async function fetchAirQualityData() {
    try {
      const res = await fetch('/api/environmental/air-quality');
      if (res.ok) {
        state.airQuality = await res.json();
        renderAirQuality(state.airQuality);
      }
    } catch (err) {
      console.warn('Could not load air quality telemetry:', err);
    }
  }

  async function fetchIssues() {
    try {
      let url = '/api/issues';
      const params = new URLSearchParams();
      if (state.activeFilterCategory) params.append('category', state.activeFilterCategory);
      if (state.activeFilterStatus) params.append('status', state.activeFilterStatus);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        state.issues = await res.json();
        renderIssuesFeed();
        renderMapPins();
        updateReportCountBadges();
      } else {
        renderIssuesError('Failed to load issues from server.');
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      renderIssuesError('Unable to connect to FastAPI service.');
    }
  }

  // ---------------------------------------------------------------------------
  // Rendering Helpers
  // ---------------------------------------------------------------------------

  function renderEnvironmentalOverview(data) {
    if (!data) return;

    if (heroCanopy) heroCanopy.textContent = `${data.tree_canopy_coverage_pct}%`;
    if (heroWaste) heroWaste.textContent = `${data.waste_collection_efficiency_pct}%`;
    if (heroWater) heroWater.textContent = `${data.waterbody_cleanliness_score}/100`;

    if (overviewCanopy) overviewCanopy.textContent = `${data.tree_canopy_coverage_pct}%`;
    if (overviewWaste) overviewWaste.textContent = `${data.waste_collection_efficiency_pct}%`;
    if (overviewWater) overviewWater.textContent = `${data.waterbody_cleanliness_score}/100`;
    if (overviewReports) overviewReports.textContent = data.active_civic_reports_count;
  }

  function renderAirQuality(data) {
    if (!data) return;

    if (heroAqiVal) heroAqiVal.textContent = data.aqi_index;
    if (heroAqiStatus) heroAqiStatus.textContent = `${data.aqi_status} Air Quality`;
    if (heroAqiPrimary) heroAqiPrimary.textContent = data.primary_pollutant;

    if (aqiMeterVal) aqiMeterVal.textContent = data.aqi_index;
    if (aqiMeterStatus) {
      aqiMeterStatus.textContent = data.aqi_status;
      aqiMeterStatus.className = `meter-status ${data.aqi_status.toLowerCase()}`;
    }
    if (aqiPrimaryPollutant) aqiPrimaryPollutant.textContent = data.primary_pollutant;
    if (aqiStationName) aqiStationName.textContent = data.sensor_station;
    if (aqiUpdatedTime) {
      const timeStr = new Date(data.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      aqiUpdatedTime.textContent = `Updated: ${timeStr} (Simulated)`;
    }

    if (pollutantsList && data.metrics) {
      pollutantsList.innerHTML = data.metrics.map(metric => `
        <div class="pollutant-row">
          <div class="pollutant-info">
            <span class="pollutant-param">${escapeHtml(metric.parameter)}</span>
            <span class="pollutant-desc">${escapeHtml(metric.description)}</span>
          </div>
          <div class="pollutant-metrics">
            <div class="pollutant-reading">
              <span class="reading-val">${metric.value}</span>
              <span class="reading-unit">${escapeHtml(metric.unit)}</span>
            </div>
            <span class="pollutant-status-pill status-${metric.status.toLowerCase()}">
              ${escapeHtml(metric.status)}
            </span>
          </div>
        </div>
      `).join('');
    }
  }

  function renderIssuesFeed() {
    if (!issuesGrid) return;

    let filtered = state.issues;

    // Apply Client-Side Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      issuesGrid.innerHTML = `
        <div class="empty-state">
          <p>No civic reports found matching your current filter criteria.</p>
          <button class="btn btn-secondary btn-sm" id="btnResetFilters" style="margin-top: 1rem;">
            Clear Filters
          </button>
        </div>
      `;
      const btnReset = document.getElementById('btnResetFilters');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          categoryFilter.value = '';
          statusFilter.value = '';
          searchInput.value = '';
          state.activeFilterCategory = '';
          state.activeFilterStatus = '';
          state.searchQuery = '';
          fetchIssues();
        });
      }
      return;
    }

    issuesGrid.innerHTML = filtered.map(issue => createIssueCardHtml(issue)).join('');

    // Attach upvote listeners
    document.querySelectorAll('.upvote-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const issueId = e.currentTarget.dataset.id;
        handleUpvote(issueId, e.currentTarget);
      });
    });
  }

  function createIssueCardHtml(issue) {
    const formattedDate = formatTimeAgo(issue.created_at);
    const categoryClass = `category-${issue.category}`;
    const severityClass = `severity-${issue.severity}`;
    const statusClass = `status-${issue.status}`;
    const reporter = issue.reporter_name ? escapeHtml(issue.reporter_name) : 'Anonymous Citizen';

    return `
      <article class="issue-card" id="card-${issue.id}" data-id="${issue.id}">
        <div class="issue-card-top">
          <div class="issue-badges-row">
            <div class="badges-left">
              <span class="category-badge ${categoryClass}">
                ${formatCategoryLabel(issue.category)}
              </span>
              <span class="severity-pill ${severityClass}">
                ${issue.severity.toUpperCase()}
              </span>
              ${issue.is_demo_entry ? '<span class="seed-flag" title="Sample demonstration entry">Demo Seed</span>' : '<span class="seed-flag" title="Submitted in current session">Session Report</span>'}
            </div>
            <span class="status-badge ${statusClass}">
              ${issue.status}
            </span>
          </div>

          <h3 class="issue-card-title">${escapeHtml(issue.title)}</h3>
          <p class="issue-card-desc">${escapeHtml(issue.description)}</p>

          <div class="issue-location-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${escapeHtml(issue.location)}</span>
          </div>
        </div>

        <div class="issue-card-bottom">
          <div class="reporter-attribution">
            <span class="reporter-name">${reporter}</span>
            <span class="report-time">${formattedDate}</span>
          </div>

          <button class="upvote-button" data-id="${issue.id}" title="Confirm this issue is present">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span>Confirm (<strong class="confirm-count">${issue.confirmations}</strong>)</span>
          </button>
        </div>
      </article>
    `;
  }

  function renderIssuesError(message) {
    if (!issuesGrid) return;
    issuesGrid.innerHTML = `
      <div class="empty-state">
        <p style="color: #f87171;">${escapeHtml(message)}</p>
        <button class="btn btn-secondary btn-sm" onclick="location.reload()" style="margin-top: 1rem;">
          Retry
        </button>
      </div>
    `;
  }

  function updateReportCountBadges() {
    const count = state.issues.length;
    if (proofActiveCount) proofActiveCount.textContent = count;
    if (overviewReports) overviewReports.textContent = count;
  }

  // ---------------------------------------------------------------------------
  // Interactive Map Radar & Pins
  // ---------------------------------------------------------------------------

  function renderMapPins() {
    if (!mapPinsContainer) return;

    // Use deterministic spatial projection for visualization
    mapPinsContainer.innerHTML = '';

    // Assign mock coordinates inside map canvas bounds (10% - 90%)
    state.issues.forEach((issue, index) => {
      let leftPct = 50;
      let topPct = 50;

      if (issue.latitude && issue.longitude) {
        // Map realistic Bangalore coordinates (12.91 - 13.01 N, 77.56 - 77.65 E) to canvas %
        const latMin = 12.91, latMax = 13.01;
        const lonMin = 77.56, lonMax = 77.66;
        
        leftPct = Math.max(12, Math.min(88, ((issue.longitude - lonMin) / (lonMax - lonMin)) * 100));
        topPct = Math.max(15, Math.min(85, (1 - (issue.latitude - latMin) / (latMax - latMin)) * 100));
      } else {
        // Deterministic pseudo-random distribution based on issue ID
        const hash = simpleHash(issue.id || `pin-${index}`);
        leftPct = 20 + (hash % 60);
        topPct = 25 + ((hash * 7) % 55);
      }

      const pin = document.createElement('button');
      pin.className = `map-pin pin-${issue.category}`;
      pin.style.left = `${leftPct}%`;
      pin.style.top = `${topPct}%`;
      pin.title = `${issue.title} (${issue.location})`;
      pin.setAttribute('aria-label', `Issue: ${issue.title}`);

      // Icon letter
      const letter = issue.category.charAt(0).toUpperCase();
      pin.innerHTML = `<span class="pin-icon-inner">${letter}</span>`;

      pin.addEventListener('click', () => {
        showMapPinDetail(issue, pin);
      });

      mapPinsContainer.appendChild(pin);
    });
  }

  function showMapPinDetail(issue, pinElement) {
    if (!mapPinCard || !pinCardContent) return;

    // Remove active highlight from all pins
    document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
    pinElement.classList.add('active');

    state.selectedMapIssueId = issue.id;

    pinCardContent.innerHTML = `
      <div class="pin-card-meta">
        <span class="category-badge category-${issue.category}">${formatCategoryLabel(issue.category)}</span>
        <span class="severity-pill severity-${issue.severity}">${issue.severity.toUpperCase()}</span>
      </div>
      <h5>${escapeHtml(issue.title)}</h5>
      <p>${escapeHtml(issue.description.slice(0, 160))}${issue.description.length > 160 ? '...' : ''}</p>
      <div class="pin-card-loc">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${escapeHtml(issue.location)}</span>
      </div>
      <div style="margin-top: 0.75rem;">
        <a href="#card-${issue.id}" class="banner-link" style="font-size: 0.75rem;">
          View in Civic Feed &rarr;
        </a>
      </div>
    `;

    mapPinCard.classList.remove('hidden');
    mapPinCard.setAttribute('aria-hidden', 'false');
  }

  if (pinCardClose) {
    pinCardClose.addEventListener('click', () => {
      if (mapPinCard) {
        mapPinCard.classList.add('hidden');
        mapPinCard.setAttribute('aria-hidden', 'true');
      }
      document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
    });
  }

  if (btnRecenterMap) {
    btnRecenterMap.addEventListener('click', () => {
      if (mapPinCard) mapPinCard.classList.add('hidden');
      document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
      renderMapPins();
    });
  }

  // ---------------------------------------------------------------------------
  // Upvote Action Handler
  // ---------------------------------------------------------------------------

  async function handleUpvote(issueId, buttonEl) {
    try {
      buttonEl.disabled = true;
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
      });

      if (res.ok) {
        const updated = await res.json();
        const countSpan = buttonEl.querySelector('.confirm-count');
        if (countSpan) countSpan.textContent = updated.confirmations;
        buttonEl.classList.add('upvoted');

        // Update in-memory state
        const target = state.issues.find(i => i.id === issueId);
        if (target) target.confirmations = updated.confirmations;
      }
    } catch (err) {
      console.error('Error confirming issue:', err);
    } finally {
      buttonEl.disabled = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Form Submission & Validation
  // ---------------------------------------------------------------------------

  if (issueDescription && descCharCount) {
    issueDescription.addEventListener('input', () => {
      const len = issueDescription.value.length;
      descCharCount.textContent = `${len} / 1500`;
      if (len > 1500) {
        descCharCount.style.color = '#f87171';
      } else {
        descCharCount.style.color = 'var(--text-muted)';
      }
    });
  }

  // Prefill Sample Location Helper
  if (btnPrefillLocation) {
    btnPrefillLocation.addEventListener('click', () => {
      const samples = [
        { loc: 'Cross Road 4, Sector 8, Eco-District', lat: 12.9754, lon: 77.6012 },
        { loc: 'Opposite Central City Botanical Garden, Ward 5', lat: 12.9512, lon: 77.5843 },
        { loc: 'Lake Perimeter Road, North Basin Bridge', lat: 12.9821, lon: 77.6321 },
        { loc: 'Industrial Link Road, Block B Junction', lat: 12.9388, lon: 77.6175 },
      ];
      const pick = samples[Math.floor(Math.random() * samples.length)];

      const locInput = document.getElementById('issueLocation');
      const latInput = document.getElementById('issueLatitude');
      const lonInput = document.getElementById('issueLongitude');

      if (locInput) locInput.value = pick.loc;
      if (latInput) latInput.value = pick.lat;
      if (lonInput) lonInput.value = pick.lon;
    });
  }

  if (civicReportForm) {
    civicReportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideBanners();

      // Extract Form Fields
      const title = document.getElementById('issueTitle').value.trim();
      const category = document.getElementById('issueCategory').value;
      const severity = document.getElementById('issueSeverity').value;
      const location = document.getElementById('issueLocation').value.trim();
      const description = document.getElementById('issueDescription').value.trim();
      const reporter_name = document.getElementById('reporterName').value.trim() || null;
      const latVal = document.getElementById('issueLatitude').value;
      const lonVal = document.getElementById('issueLongitude').value;

      const latitude = latVal ? parseFloat(latVal) : null;
      const longitude = lonVal ? parseFloat(lonVal) : null;

      // Client-Side Validation
      const errors = [];
      if (!title || title.length < 3 || title.length > 120) {
        errors.push('Title must be between 3 and 120 characters.');
      }
      if (!category) {
        errors.push('Please choose a valid problem category.');
      }
      if (!severity) {
        errors.push('Please select a severity level.');
      }
      if (!location || location.length < 3 || location.length > 160) {
        errors.push('Location must be between 3 and 160 characters.');
      }
      if (!description || description.length < 10 || description.length > 1500) {
        errors.push('Description must be between 10 and 1500 characters.');
      }
      if (latitude !== null && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
        errors.push('Latitude must be a valid coordinate between -90 and 90.');
      }
      if (longitude !== null && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
        errors.push('Longitude must be a valid coordinate between -180 and 180.');
      }

      if (errors.length > 0) {
        showValidationErrors(errors);
        return;
      }

      // Build JSON payload
      const payload = {
        title,
        category,
        severity,
        location,
        description,
        reporter_name,
        latitude,
        longitude,
      };

      // Set Loading State
      setFormLoading(true);

      try {
        const response = await fetch('/api/issues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 201) {
          const created = await response.json();
          civicReportForm.reset();
          if (descCharCount) descCharCount.textContent = '0 / 1500';

          showSuccess(created);

          // Prepend to current issue state & re-render
          state.issues.unshift(created);
          renderIssuesFeed();
          renderMapPins();
          updateReportCountBadges();

          // Smooth scroll to created card
          const targetCard = document.getElementById(`card-${created.id}`);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.style.outline = '2px solid var(--accent-lime)';
            setTimeout(() => { targetCard.style.outline = 'none'; }, 2500);
          }
        } else {
          const errData = await response.json();
          let serverErrors = ['Server validation failed.'];
          if (errData.detail && Array.isArray(errData.detail)) {
            serverErrors = errData.detail.map(d => `${d.loc ? d.loc.slice(-1)[0] : 'field'}: ${d.msg}`);
          } else if (typeof errData.detail === 'string') {
            serverErrors = [errData.detail];
          }
          showValidationErrors(serverErrors);
        }
      } catch (err) {
        console.error('Submission error:', err);
        showValidationErrors(['Network error. Could not connect to FastAPI server.']);
      } finally {
        setFormLoading(false);
      }
    });
  }

  function setFormLoading(isLoading) {
    if (btnSubmitReport) btnSubmitReport.disabled = isLoading;
    if (submitSpinner) submitSpinner.classList.toggle('hidden', !isLoading);
    if (submitBtnText) submitBtnText.textContent = isLoading ? 'Submitting Report...' : 'Submit Civic Report';
  }

  function showValidationErrors(errors) {
    if (!reportErrorBanner || !errorList) return;
    errorList.innerHTML = errors.map(e => `<li>${escapeHtml(e)}</li>`).join('');
    reportErrorBanner.classList.remove('hidden');
    reportErrorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showSuccess(created) {
    if (!reportSuccessBanner) return;
    if (createdReportId) createdReportId.textContent = created.id;
    reportSuccessBanner.classList.remove('hidden');
    reportSuccessBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideBanners() {
    if (reportSuccessBanner) reportSuccessBanner.classList.add('hidden');
    if (reportErrorBanner) reportErrorBanner.classList.add('hidden');
  }

  if (dismissSuccessBanner) {
    dismissSuccessBanner.addEventListener('click', () => {
      reportSuccessBanner.classList.add('hidden');
    });
  }

  if (dismissErrorBanner) {
    dismissErrorBanner.addEventListener('click', () => {
      reportErrorBanner.classList.add('hidden');
    });
  }

  // ---------------------------------------------------------------------------
  // Filters and Search Interactions
  // ---------------------------------------------------------------------------

  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      state.activeFilterCategory = e.target.value;
      fetchIssues();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      state.activeFilterStatus = e.target.value;
      fetchIssues();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderIssuesFeed();
    });
  }

  if (btnRefreshFeed) {
    btnRefreshFeed.addEventListener('click', () => {
      fetchIssues();
      fetchEnvironmentalOverview();
      fetchAirQualityData();
    });
  }

  // ---------------------------------------------------------------------------
  // Navigation & Mobile Toggle
  // ---------------------------------------------------------------------------

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close menu on link click
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Highlight navigation item on scroll
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.main-nav .nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Utility Functions
  // ---------------------------------------------------------------------------

  function formatCategoryLabel(cat) {
    const map = {
      garbage: 'Garbage Dump',
      pothole: 'Road Pothole',
      waterlogging: 'Waterlogging',
      pollution: 'Air/Noise Pollution',
      other: 'Civic Issue',
    };
    return map[cat] || cat;
  }

  function formatTimeAgo(isoString) {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // ---------------------------------------------------------------------------
  // Initial Bootstrapping
  // ---------------------------------------------------------------------------
  checkSystemHealth();
  fetchEnvironmentalOverview();
  fetchAirQualityData();
  fetchIssues();
});

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Camera, Check, Flag, Globe2, Lock, LogOut, MoreVertical, Plus, UserMinus, Users, X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import FeedHeader from '../components/feed/FeedHeader';
import FeedMobileNav from '../components/feed/FeedMobileNav';
import FeedSidebar from '../components/feed/FeedSidebar';
import PostCard from '../components/feed/PostCard';
import PostComposer from '../components/feed/PostComposer';
import {
  approveCommunityJoinRequest,
  createCommunity,
  createPost,
  getCommunities,
  getCommunityJoinRequests,
  getCommunityMembers,
  getCommunityPosts,
  getCurrentUser,
  getNotifications,
  joinCommunity,
  leaveCommunity,
  markNotificationAsRead,
  rejectCommunityJoinRequest,
  reportCommunity,
  removeCommunityMember,
} from '../utils/authApi';

const REPORT_REASONS = [
  ['INAPPROPRIATE_CONTENT', 'Conteúdo inadequado'],
  ['VIOLENCE_OR_THREATS', 'Violência ou ameaça'],
  ['HATE_SPEECH', 'Discurso de ódio'],
  ['SPAM_OR_SCAM', 'Spam ou golpe'],
  ['PERSONAL_DATA', 'Divulgação de dados pessoais'],
  ['OTHER', 'Outro'],
];

function readGroupImage(event, setDraft) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) return;
  const reader = new FileReader();
  reader.onload = () => setDraft((current) => ({ ...current, imageUrl: reader.result, imagePosition: { x: 50, y: 50 } }));
  reader.readAsDataURL(file);
}

export default function Communities() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [communitySearch, setCommunitySearch] = useState('');
  const [mobileTab, setMobileTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [publishError, setPublishError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [requestNotice, setRequestNotice] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState('');
  const [reportNotice, setReportNotice] = useState('');
  const [reportGroup, setReportGroup] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [openCommunityMenu, setOpenCommunityMenu] = useState('');
  const [leaveGroup, setLeaveGroup] = useState(null);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [cancellingRequestId, setCancellingRequestId] = useState('');
  const [membersGroup, setMembersGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [handlingRequestId, setHandlingRequestId] = useState('');
  const [groupDraft, setGroupDraft] = useState({
    name: '',
    description: '',
    visibility: 'PUBLIC',
    category: 'Estudo',
    imageUrl: '',
    imagePosition: { x: 50, y: 50 },
  });
  const groupImageInputRef = useRef(null);
  const groupImageDragRef = useRef(null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('unilink.user') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const items = await getNotifications();
        if (active) setNotifications(items);
      } catch {
        if (active) setNotifications([]);
      }
    };
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getCommunityPosts(), getCommunities(), getCurrentUser(), getCommunityJoinRequests()])
      .then(([result, availableCommunities, currentUser, joinRequests]) => {
        if (!active) return;
        setPosts(result);
        setCommunities(availableCommunities);
        setUser(currentUser);
        setCommunityRequests(joinRequests);
        localStorage.setItem('unilink.user', JSON.stringify(currentUser));
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const publishCommunityPost = async (content, privacy, communityName, media) => {
    setPublishError('');
    setPublishing(true);
    try {
      const created = await createPost(content, privacy, communityName, media);
      setPosts((current) => [created, ...current]);
      return true;
    } catch (requestError) {
      setPublishError(requestError.message);
      return false;
    } finally {
      setPublishing(false);
    }
  };

  const enterCommunity = async (community) => {
    try {
      const updatedCommunity = community.member
        ? community
        : await joinCommunity(community.id);
      setCommunities((current) => current.map((item) => (
        item.id === updatedCommunity.id ? updatedCommunity : item
      )));
      if (updatedCommunity.visibility === 'PRIVATE' && updatedCommunity.requestPending) {
        setRequestNotice(true);
        return;
      }
      setLoadError('');
    } catch (requestError) {
      setLoadError(requestError.message);
    }
  };

  const memberCommunityNames = new Set(
    communities
      .filter((community) => community.member)
      .map((community) => community.name),
  );
  const visiblePosts = posts.filter((post) => {
    if (!post.communityName) return false;
    if (selectedCommunity !== 'all') {
      return post.communityName === selectedCommunity;
    }
    return memberCommunityNames.has(post.communityName);
  });
  const selectedCommunityDetails = selectedCommunity === 'all'
    ? null
    : communities.find((community) => community.name === selectedCommunity);
  const topNotifications = notifications.slice(0, 3);
  const isInsideSpecificGroup = Boolean(selectedCommunityDetails);
  const mobileTabs = [
    { id: 'feed', label: 'Publicações' },
    { id: 'discover', label: 'Descobrir' },
  ];
  const groupCategories = ['Estudo', 'Lazer', 'Tecnologia', 'Carreira', 'Esportes', 'Arte', 'Música', 'Voluntariado'];

  const resetCreateGroupForm = () => {
    setGroupDraft({
      name: '',
      description: '',
      visibility: 'PUBLIC',
      category: 'Estudo',
      imageUrl: '',
      imagePosition: { x: 50, y: 50 },
    });
    setCreateGroupError('');
  };

  const startGroupImageDrag = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    groupImageDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialX: groupDraft.imagePosition.x,
      initialY: groupDraft.imagePosition.y,
    };
  };

  const moveGroupImageDrag = (event) => {
    const drag = groupImageDragRef.current;
    if (!drag) return;
    const bounds = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!bounds) return;
    setGroupDraft((current) => ({
      ...current,
      imagePosition: {
        x: Math.max(0, Math.min(100, drag.initialX - ((event.clientX - drag.startX) / bounds.width) * 100)),
        y: Math.max(0, Math.min(100, drag.initialY - ((event.clientY - drag.startY) / bounds.height) * 100)),
      },
    }));
  };

  const stopGroupImageDrag = () => {
    groupImageDragRef.current = null;
  };

  const openCreateGroup = () => {
    resetCreateGroupForm();
    setIsCreateGroupOpen(true);
  };

  const submitCreateGroup = async (event) => {
    event.preventDefault();
    setCreateGroupError('');
    setCreatingGroup(true);
    try {
      const createdGroup = await createCommunity(groupDraft);
      setCommunities((current) => [...current, createdGroup].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
      setSelectedCommunity(createdGroup.name);
      setMobileTab('discover');
      setIsCreateGroupOpen(false);
      resetCreateGroupForm();
    } catch (requestError) {
      setCreateGroupError(requestError.message);
    } finally {
      setCreatingGroup(false);
    }
  };

  const submitGroupReport = async (event) => {
    event.preventDefault();
    if (!reportGroup || !reportReason || reporting) return;
    setReporting(true);
    try {
      await reportCommunity(reportGroup.id, reportReason);
      setReportNotice(reportGroup.name);
      setReportGroup(null);
      setReportReason('');
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setReporting(false);
    }
  };

  const submitLeaveGroup = async () => {
    if (!leaveGroup || leavingGroup) return;
    const groupToLeave = leaveGroup;
    setLeaveGroup(null);
    setLeavingGroup(true);
    try {
      const updatedCommunity = await leaveCommunity(groupToLeave.id);
      setCommunities((current) => current.map((item) => (
        item.id === updatedCommunity.id ? updatedCommunity : item
      )));
      if (selectedCommunity === groupToLeave.name) {
        setSelectedCommunity('all');
        setMobileTab('discover');
      }
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setLeavingGroup(false);
    }
  };

  const cancelCommunityRequest = async (community) => {
    if (cancellingRequestId) return;
    setCancellingRequestId(community.id);
    setLoadError('');
    try {
      const updatedCommunity = await leaveCommunity(community.id);
      setCommunities((current) => current.map((item) => (
        item.id === updatedCommunity.id ? updatedCommunity : item
      )));
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setCancellingRequestId('');
    }
  };

  const openMembers = async (community) => {
    if (!community.owner) return;
    setMembersGroup(community);
    setLoadingMembers(true);
    try {
      setGroupMembers(await getCommunityMembers(community.id));
    } catch (requestError) {
      setLoadError(requestError.message);
      setMembersGroup(null);
    } finally {
      setLoadingMembers(false);
    }
  };

  const removeMember = async (member) => {
    if (!membersGroup || removingMemberId) return;
    setRemovingMemberId(member.id);
    try {
      const updatedCommunity = await removeCommunityMember(membersGroup.id, member.id);
      setGroupMembers((current) => current.filter((item) => item.id !== member.id));
      setCommunities((current) => current.map((item) => (
        item.id === updatedCommunity.id ? updatedCommunity : item
      )));
      setMembersGroup((current) => ({ ...current, ...updatedCommunity }));
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setRemovingMemberId('');
    }
  };

  const openGroupFeed = (communityName) => {
    setSelectedCommunity(communityName);
    setMobileTab('feed');
  };

  const backToGeneral = () => {
    setSelectedCommunity('all');
    setMobileTab('feed');
    navigate('/comunidades', { replace: true });
  };

  const openDiscoverForCommunity = (communityId) => {
    setMobileTab('discover');
    requestAnimationFrame(() => {
      const card = document.getElementById(`discover-community-${communityId}`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const handleJoinRequestDecision = async (request, decision) => {
    if (handlingRequestId) return;
    setHandlingRequestId(request.communityId + request.requesterId);
    try {
      if (decision === 'approve') {
        await approveCommunityJoinRequest(request.communityId, request.requesterId);
      } else {
        await rejectCommunityJoinRequest(request.communityId, request.requesterId);
      }
      const [availableCommunities, joinRequests] = await Promise.all([
        getCommunities(),
        getCommunityJoinRequests(),
      ]);
      setCommunities(availableCommunities);
      setCommunityRequests(joinRequests);
    } catch (requestError) {
      setLoadError(requestError.message);
    } finally {
      setHandlingRequestId('');
    }
  };

  const openNotificationTarget = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, read: true } : item
        )));
      } catch {
        // mantém navegação mesmo se marcar leitura falhar
      }
    }
    if (notification.targetPath) {
      navigate(notification.targetPath);
    }
  };

  useEffect(() => {
    if (!communities.length) return;
    const params = new URLSearchParams(location.search);
    const groupFromUrl = params.get('group');
    if (!groupFromUrl) return;
    const found = communities.find((community) => community.name === groupFromUrl);
    if (found) {
      setSelectedCommunity(found.name);
      setMobileTab('feed');
    }
  }, [location.search, communities]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    if (!id) return;
    const timeout = window.setTimeout(() => {
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [location.hash, visiblePosts.length, mobileTab, selectedCommunity]);

  return (
    <div className="large-screen-dashboard min-h-screen bg-[#F4F5F7] pb-24 font-sans text-slate-700 lg:h-dvh lg:overflow-hidden lg:pb-0">
      <FeedHeader />
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 px-3 sm:mt-6 sm:gap-6 sm:px-4 lg:grid-cols-12 lg:items-start">
        <FeedSidebar
          activeItem="communities"
          selectedCommunity={selectedCommunity}
          communities={communities}
          onCreateCommunity={openCreateGroup}
          onCommunitySelect={(name) => {
            setSelectedCommunity(name);
            setMobileTab('feed');
          }}
          communitySearch={communitySearch}
          onCommunitySearchChange={setCommunitySearch}
        />
        <main className="primary-scroll col-span-1 min-w-0 space-y-5 lg:col-span-6 lg:h-[calc(100dvh-96px)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          {selectedCommunityDetails ? (
            <section className="space-y-2">
              <button type="button" onClick={backToGeneral} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-slate-800">
                <ArrowLeft className="h-3.5 w-3.5" />Voltar para geral
              </button>
              <div className="overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-40 overflow-hidden bg-slate-200 sm:h-48">
                  <img src={selectedCommunityDetails.imageUrl} alt={`Imagem do grupo ${selectedCommunityDetails.name}`} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="relative px-4 pb-4 pt-3 sm:px-5">
                  <h1 className="text-xl font-extrabold text-slate-800">{selectedCommunityDetails.name}</h1>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{selectedCommunityDetails.description}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      {selectedCommunityDetails.category} ·{' '}
                      {selectedCommunityDetails.owner ? (
                        <button type="button" onClick={() => openMembers(selectedCommunityDetails)} className="font-semibold text-amber-800 underline-offset-2 hover:underline">
                          {selectedCommunityDetails.memberCount} participantes
                        </button>
                      ) : `${selectedCommunityDetails.memberCount} participantes`} · {selectedCommunityDetails.visibility === 'PRIVATE' ? 'Privado' : 'Público'}
                    </p>
                    <div className="relative shrink-0">
                      <button type="button" onClick={() => setOpenCommunityMenu((current) => current === selectedCommunityDetails.id ? '' : selectedCommunityDetails.id)} aria-label="Mais opções do grupo" title="Mais opções" className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openCommunityMenu === selectedCommunityDetails.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                          <button type="button" onClick={() => { setOpenCommunityMenu(''); setReportGroup(selectedCommunityDetails); setReportReason(''); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100">
                            <Flag className="h-3.5 w-3.5" />Denunciar grupo
                          </button>
                          {selectedCommunityDetails.member && (
                            <button type="button" onClick={() => { setOpenCommunityMenu(''); setLeaveGroup(selectedCommunityDetails); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-700 hover:bg-red-50">
                              <LogOut className="h-3.5 w-3.5" />Sair do grupo
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section>
              <h1 className="text-xl font-extrabold text-slate-800">Grupos</h1>
              <p className="mt-1 text-xs text-slate-500">Encontre grupos ligados à sua vida universitária.</p>
            </section>
          )}
          {!isInsideSpecificGroup && (
            <nav aria-label="Navegação de comunidades" className="grid grid-cols-2 border-b border-slate-200">
              {mobileTabs.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => setMobileTab(id)} aria-current={mobileTab === id ? 'page' : undefined} className={`min-h-11 border-b-2 px-1 text-[11px] font-semibold ${mobileTab === id ? 'border-amber-400 text-slate-900' : 'border-transparent text-slate-500'}`}>{label}</button>
              ))}
            </nav>
          )}

          {(mobileTab === 'feed' || isInsideSpecificGroup) && (
            <>
              <PostComposer
                user={user}
                onSubmit={publishCommunityPost}
                error={publishError}
                publishing={publishing}
                communityMode
                communities={communities.filter((community) => community.member)}
                fixedCommunityName={selectedCommunityDetails?.name || ''}
              />
              <section className="space-y-4" aria-label="Publicações da comunidade">
                {loadError ? (
                  <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{loadError}</p>
                ) : loading ? (
                  <p className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando comunidades...</p>
                ) : visiblePosts.length ? visiblePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    showCommunityAuthor
                  />
                )) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    <Users className="mx-auto h-8 w-8 text-slate-300" />
                    <h2 className="mt-3 font-bold text-slate-700">{selectedCommunity === 'all' ? 'Ainda não há publicações nos grupos' : 'Nenhuma publicação neste grupo'}</h2>
                    <p className="mt-1 text-xs">Explore os grupos ou publique para iniciar a conversa.</p>
                  </div>
                )}
              </section>
            </>
          )}

          {!isInsideSpecificGroup && mobileTab === 'discover' && (
            <section className="space-y-3" aria-label="Grupos disponíveis">
              {loadError ? (
                <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">{loadError}</p>
              ) : loading ? (
                <p className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Carregando comunidades...</p>
              ) : communities.length ? communities.map((community) => (
                <article id={`discover-community-${community.id}`} key={community.id} className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-[16/7] overflow-hidden bg-slate-200">
                    <img src={community.imageUrl} alt={`Imagem do grupo ${community.name}`} className="h-full w-full object-cover" style={{ objectPosition: `${community.imagePosition?.x ?? 50}% ${community.imagePosition?.y ?? 50}%` }} loading="lazy" />
                    <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-800">{community.category}</span>
                    <span className="absolute right-3 top-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-slate-800">{community.visibility === 'PRIVATE' ? 'Privada' : 'Pública'}</span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <button type="button" onClick={() => openGroupFeed(community.name)} className="text-left text-sm font-extrabold text-slate-800 hover:underline">
                        {community.name}
                      </button>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{community.description}</p>
                      <p className="mt-2 text-[10px] text-slate-400">{community.campus} · {community.memberCount} participantes · {community.visibility === 'PRIVATE' ? 'Privado' : 'Público'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" disabled={cancellingRequestId === community.id} onClick={() => (community.requestPending ? cancelCommunityRequest(community) : enterCommunity(community))} className={`group rounded-lg px-3 py-2.5 text-xs font-bold transition disabled:cursor-wait disabled:opacity-70 ${community.requestPending ? 'bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-700' : 'bg-[#FFF8E6] text-amber-900 hover:bg-amber-100'}`}>
                        {community.requestPending ? (cancellingRequestId === community.id ? 'Cancelando...' : <><span className="group-hover:hidden">Solicitação enviada</span><span className="hidden group-hover:inline">Cancelar solicitação</span></>) : community.member ? 'Participando' : community.visibility === 'PRIVATE' ? 'Pedir participação' : 'Participar'}
                      </button>
                      <button type="button" onClick={() => { setReportGroup(community); setReportReason(''); }} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                        <Flag className="h-3.5 w-3.5" />Denunciar grupo
                      </button>
                    </div>
                  </div>
                </article>
              )) : (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Nenhum grupo disponível.</p>
              )}
            </section>
          )}
        </main>

        <aside className="hidden space-y-5 lg:col-span-3 lg:block lg:overflow-y-auto">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">Atividade dos seus grupos</h2>
            {topNotifications.length ? (
              <div className="space-y-2">
                {topNotifications.map((notification) => (
                  <button key={notification.id} type="button" onClick={() => openNotificationTarget(notification)} className={`w-full rounded-xl px-3 py-2 text-left transition hover:bg-slate-50 ${notification.read ? 'bg-slate-50' : 'bg-amber-50/40'}`}>
                    <p className="text-xs font-semibold text-slate-800">{notification.message}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-3 text-center text-xs text-slate-400">Sem atividades por enquanto.</p>
            )}
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Sugestões para você</h2></div>
            <div className="space-y-3">
              {communities.slice(0, 3).map((community) => (
                <button key={community.id} type="button" onClick={() => openDiscoverForCommunity(community.id)} className="flex w-full items-center gap-3 rounded-xl text-left hover:bg-slate-50">
                  <img src={community.imageUrl} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-slate-800">{community.name}</span><span className="block text-[10px] text-slate-500">{community.visibility === 'PRIVATE' ? 'Privada' : 'Pública'} · {community.category}</span></span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setMobileTab('discover')} className="mt-4 flex w-full items-center justify-center gap-1 border-t border-slate-100 pt-3 text-xs font-semibold text-amber-800">Explore mais grupos <ArrowRight className="h-3 w-3" /></button>
          </section>
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-800">Convites</h2>
            {communityRequests.length ? (
              <div className="space-y-3">
                {communityRequests.map((request) => {
                  const requestKey = request.communityId + request.requesterId;
                  const isHandling = handlingRequestId === requestKey;
                  return (
                    <div key={requestKey} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3C4] text-xs font-bold text-slate-800">
                          {request.requesterAvatarUrl ? <img src={request.requesterAvatarUrl} alt="" className="h-full w-full object-cover" /> : request.requesterName?.charAt(0).toLocaleUpperCase('pt-BR')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800">{request.requesterName}</p>
                          <p className="truncate text-[11px] text-slate-500">@{request.requesterUsername}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-slate-600">Pediu para entrar em <strong>{request.communityName}</strong>.</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" disabled={isHandling} onClick={() => handleJoinRequestDecision(request, 'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-200 disabled:opacity-50">
                          <Check className="h-3.5 w-3.5" />Aceitar
                        </button>
                        <button type="button" disabled={isHandling} onClick={() => handleJoinRequestDecision(request, 'reject')} className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2.5 py-1.5 text-[11px] font-bold text-red-700 transition hover:bg-red-200 disabled:opacity-50">
                          <X className="h-3.5 w-3.5" />Recusar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-3 text-center text-xs text-slate-400">Você não tem convites pendentes.</p>
            )}
          </section>
        </aside>
      </div>
      <FeedMobileNav activeItem="communities" />
      {requestNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setRequestNotice(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="community-request-title" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800"><Users className="h-6 w-6" /></span>
            <h2 id="community-request-title" className="mt-4 text-base font-extrabold text-slate-800">Solicitação enviada!</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Um administrador da comunidade analisará seu pedido. Você poderá participar quando ele for aprovado.</p>
            <button type="button" onClick={() => setRequestNotice(false)} className="mt-5 w-full rounded-xl bg-[#FFC72C] px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-amber-400">Entendi</button>
          </section>
        </div>
      )}
      {leaveGroup && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !leavingGroup) setLeaveGroup(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="leave-community-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800"><LogOut className="h-6 w-6" /></span>
            <h2 id="leave-community-title" className="mt-4 text-center text-lg font-extrabold text-slate-900">Sair do grupo?</h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
              Você deixará de ver as publicações de <strong>{leaveGroup.name}</strong>. Para participar novamente, será necessário entrar de novo
              {leaveGroup.visibility === 'PRIVATE' ? ' e aguardar uma nova aprovação.' : '.'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={leavingGroup} onClick={() => setLeaveGroup(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
              <button type="button" disabled={leavingGroup} onClick={submitLeaveGroup} className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{leavingGroup ? 'Saindo...' : 'Sair do grupo'}</button>
            </div>
          </section>
        </div>
      )}
      {membersGroup && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !removingMemberId) setMembersGroup(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="community-members-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="community-members-title" className="text-base font-extrabold text-slate-800">Participantes</h2>
                <p className="mt-1 text-xs text-slate-500">{membersGroup.name}</p>
              </div>
              <button type="button" disabled={Boolean(removingMemberId)} onClick={() => setMembersGroup(null)} aria-label="Fechar" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
              {loadingMembers ? (
                <p className="py-8 text-center text-sm text-slate-500">Carregando participantes...</p>
              ) : groupMembers.length ? groupMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 rounded-2xl px-2 py-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3C4] font-bold text-slate-800">
                    {member.avatarUrl
                      ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${member.avatarPositionX ?? 50}% ${member.avatarPositionY ?? 50}%` }} />
                      : member.name.charAt(0).toLocaleUpperCase('pt-BR')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">@{member.username}</p>
                  </div>
                  {member.id !== user?.id && (
                    <button type="button" disabled={Boolean(removingMemberId)} onClick={() => removeMember(member)} className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                      <UserMinus className="h-3.5 w-3.5" />{removingMemberId === member.id ? 'Removendo...' : 'Remover'}
                    </button>
                  )}
                </div>
              )) : (
                <p className="py-8 text-center text-sm text-slate-500">Nenhum participante encontrado.</p>
              )}
            </div>
          </section>
        </div>
      )}
      {reportGroup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !reporting) setReportGroup(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="community-report-form-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <form onSubmit={submitGroupReport}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="community-report-form-title" className="text-lg font-extrabold text-slate-900">Denunciar grupo</h2>
                  <p className="mt-1 text-sm text-slate-500">Por que você deseja denunciar <strong>{reportGroup.name}</strong>?</p>
                </div>
                <button type="button" disabled={reporting} onClick={() => setReportGroup(null)} aria-label="Fechar" className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-5 space-y-2">
                {REPORT_REASONS.map(([value, label]) => (
                  <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${reportReason === value ? 'border-amber-400 bg-amber-50 text-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="radio" name="community-report-reason" value={value} checked={reportReason === value} onChange={(event) => setReportReason(event.target.value)} className="accent-amber-500" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" disabled={reporting} onClick={() => setReportGroup(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={!reportReason || reporting} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{reporting ? 'Enviando...' : 'Enviar denúncia'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      {reportNotice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportNotice(''); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="community-report-title" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700"><Flag className="h-6 w-6" /></span>
            <h2 id="community-report-title" className="mt-4 text-base font-extrabold text-slate-800">Denúncia enviada</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Sua denúncia foi enviada e será revisada. Obrigado por nos ajudar a manter a comunidade saudável e um ambiente seguro para todos.</p>
            <button type="button" onClick={() => setReportNotice('')} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Entendi</button>
          </section>
        </div>
      )}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateGroupOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-group-title" className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <form onSubmit={submitCreateGroup}>
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <button type="button" onClick={() => setIsCreateGroupOpen(false)} aria-label="Fechar" className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100"><X className="h-5 w-5" /></button>
                  <h2 id="create-group-title" className="text-lg font-extrabold text-slate-800">Criar grupo</h2>
                </div>
                <button type="submit" disabled={creatingGroup} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC72C] px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60">
                  <Plus className="h-3.5 w-3.5" />{creatingGroup ? 'Criando...' : 'Criar grupo'}
                </button>
              </div>

              <div className="space-y-4 px-4 pb-5 pt-4 sm:px-5">
                <div className="relative h-44 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-amber-500 sm:h-52">
                  {groupDraft.imageUrl && <img src={groupDraft.imageUrl} alt="Prévia da foto do grupo" draggable="false" onPointerDown={startGroupImageDrag} onPointerMove={moveGroupImageDrag} onPointerUp={stopGroupImageDrag} onPointerCancel={stopGroupImageDrag} className="h-full w-full cursor-grab select-none object-cover touch-none active:cursor-grabbing" style={{ objectPosition: `${groupDraft.imagePosition.x}% ${groupDraft.imagePosition.y}%` }} />}
                  <button type="button" onClick={() => groupImageInputRef.current?.click()} aria-label="Alterar foto do grupo" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/70 p-3 text-white transition hover:bg-slate-900">
                    <Camera className="h-5 w-5" />
                  </button>
                  <span className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800">Foto do grupo</span>
                </div>
                <input ref={groupImageInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={(event) => readGroupImage(event, setGroupDraft)} />

                <label className="block text-sm font-semibold text-slate-700">
                  Nome
                  <input required maxLength={100} autoFocus value={groupDraft.name} onChange={(event) => setGroupDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Descrição
                  <textarea required maxLength={500} rows={4} value={groupDraft.description} onChange={(event) => setGroupDraft((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100" />
                </label>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Privacidade</p>
                      <p className="text-xs text-slate-500">Escolha se o grupo será público ou privado.</p>
                    </div>
                    <button type="button" role="switch" aria-checked={groupDraft.visibility === 'PRIVATE'} onClick={() => setGroupDraft((current) => ({ ...current, visibility: current.visibility === 'PRIVATE' ? 'PUBLIC' : 'PRIVATE' }))} className={`relative inline-flex h-8 w-16 items-center rounded-full p-1 transition ${groupDraft.visibility === 'PRIVATE' ? 'bg-slate-800' : 'bg-amber-300'}`}>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-700 shadow transition ${groupDraft.visibility === 'PRIVATE' ? 'translate-x-8' : 'translate-x-0'}`}>
                        {groupDraft.visibility === 'PRIVATE' ? <Lock className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-700">{groupDraft.visibility === 'PRIVATE' ? 'Privado' : 'Público'}</p>
                </div>

                <label className="block text-sm font-semibold text-slate-700">
                  Classificação
                  <select value={groupDraft.category} onChange={(event) => setGroupDraft((current) => ({ ...current, category: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100">
                    {groupCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                {createGroupError && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{createGroupError}</p>}
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

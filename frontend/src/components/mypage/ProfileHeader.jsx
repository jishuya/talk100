import { getIcon } from '../../utils/iconMap';

const ProfileHeader = ({
  profile,
  onAvatarClick
}) => {
  if (!profile) return null;

  return (
    <header className="bg-gradient-primary pt-3 px-4 pb-8 text-white relative">
      <div className="flex justify-between items-center mb-6">
        {/* 설정 버튼 영역 (필요시 활성화) */}
      </div>

      <div className="flex items-center gap-4">
        <div
          className="profile-avatar w-20 h-20 bg-white rounded-full flex items-center justify-center text-[40px] shadow-lg cursor-pointer relative touchable"
          onClick={onAvatarClick}
        >
          <span>{profile.avatar}</span>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs border-2 border-white">
            {getIcon('IoPencil', { size: 'sm', color: 'text-white' })}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold mb-1">{profile.nickname}</div>
          <div className="text-sm opacity-90 mb-2">{profile.email}</div>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
            Lv.{profile.level} {profile.gradeName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
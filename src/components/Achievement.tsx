import { AchievementType } from "@/types/achievement";

export default function Achievement({achievements}:{achievements: AchievementType[]}) {
    return (
        <>
            {achievements.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {achievements.map(ach => {
                        const Icon = ach.icon;
                        return (
                            <li
                                key={ach.id}
                                className={`flex flex-col items-center text-center p-3 rounded-lg transition-all ${ach.unlocked ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${ach.unlocked ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                                    <Icon className={`w-8 h-8 ${ach.unlocked ? 'text-yellow-500' : 'text-gray-400'}`} />
                                </div>
                                <h4
                                    className={`mt-2 font-semibold text-sm ${ach.unlocked ? 'text-gray-800' : 'text-gray-500'}`}
                                >
                                    {ach.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                    <p className="text-gray-500">Complete lessons and reach milestones to earn achievements!</p>
                </div>
            )}
        </>
    )
}